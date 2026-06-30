import React, { useEffect, useState, useCallback } from 'react';
import { MessageCircle, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink, RotateCw, Send } from 'lucide-react';

interface WhatsAppIntegration {
  id: string;
  meta_business_id: string;
  whatsapp_business_account_id: string;
  whatsapp_phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  token_type: string;
  token_expires_at: string | null;
  granted_scopes: string[];
  webhook_status: string;        // 'subscribed' | 'partial' | 'pending' | 'failed' | 'not_configured'
  last_message_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  is_expired: boolean;
}

interface StatusResponse {
  connected: boolean;
  oauth_configured: boolean;
  integration?: WhatsAppIntegration;
}

/**
 * WhatsAppOAuthSection — the recommended, one-click way to connect WhatsApp.
 *
 * Renders 6 visual states:
 *   1. Not configured (META_APP_ID env not set)
 *   2. Not connected — primary "Connect WhatsApp" button
 *   3. Connected + webhook subscribed — green
 *   4. Connected but webhook not set up — yellow warning
 *   5. Token expired — red, Reconnect button
 *   6. Error — last_error message + Reconnect
 *
 * Also includes a "Send test message" form that calls /api/admin/whatsapp/send-test.
 */
export function WhatsAppOAuthSection() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from Avetisyan Beauty Clinic! This is a test message.');
  const [toast, setToast] = useState<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/meta/whatsapp/status', { credentials: 'include' });
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error('Failed to load WhatsApp OAuth status:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    // Handle redirect-back URL params
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get('wa_oauth');
    const msg = params.get('msg');
    if (oauthResult === 'success') {
      setToast({ kind: 'success', msg: 'WhatsApp connected successfully!' });
    } else if (oauthResult === 'error') {
      setToast({ kind: 'error', msg: msg || 'WhatsApp connection failed.' });
    }
    if (oauthResult) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
    if (oauthResult) {
      setTimeout(() => setToast(null), 5000);
    }
  }, [refreshStatus]);

  const handleConnect = () => {
    window.location.href = '/api/meta/whatsapp/oauth/start';
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect WhatsApp? You will need to reconnect to send or receive messages.')) return;
    try {
      const res = await fetch('/api/meta/whatsapp/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setToast({ kind: 'info', msg: 'WhatsApp disconnected.' });
      setTimeout(() => setToast(null), 3000);
      refreshStatus();
    } catch (e: any) {
      setToast({ kind: 'error', msg: e.message });
    }
  };

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      setToast({ kind: 'error', msg: 'Phone number is required' });
      return;
    }
    setSendingTest(true);
    setToast(null);
    try {
      const res = await fetch('/api/admin/whatsapp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: testPhone, message: testMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setToast({ kind: 'success', msg: `Test message sent! Message ID: ${data.messageId}` });
      setTimeout(() => setToast(null), 5000);
      setShowTestForm(false);
      refreshStatus();
    } catch (e: any) {
      setToast({ kind: 'error', msg: e.message });
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-graphite/60 text-sm py-4">
        <Loader2 size={16} className="animate-spin" /> Loading WhatsApp status...
      </div>
    );
  }

  return (
    <div className="bg-pearl/40 border border-graphite/10 rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-display text-lg text-graphite flex items-center gap-2">
            <MessageCircle size={20} className="text-gold" />
            WhatsApp via Meta Login
          </h4>
          <p className="text-xs text-graphite/60 mt-1">
            Recommended. One-click OAuth — no manual token copy-pasting.
          </p>
        </div>
        {status?.connected && status.integration && (
          <WhatsAppStatusPill integration={status.integration} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm border flex items-start gap-2 ${
            toast.kind === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : toast.kind === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-graphite/10 border-graphite/20 text-graphite/80'
          }`}
        >
          {toast.kind === 'success' ? (
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
          ) : toast.kind === 'error' ? (
            <XCircle size={16} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <span className="break-all">{toast.msg}</span>
        </div>
      )}

      {/* State 1: OAuth not configured on server */}
      {status && !status.oauth_configured && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm">
          <p className="text-graphite/80 mb-2">
            <strong>Server not configured for Meta OAuth.</strong> Set these env vars on Vercel:
          </p>
          <ul className="list-disc list-inside text-graphite/70 space-y-1 font-mono text-xs">
            <li>META_APP_ID</li>
            <li>META_APP_SECRET</li>
            <li>META_WHATSAPP_REDIRECT_URI = https://avetisyan-beauty.vercel.app/api/meta/whatsapp/oauth/callback</li>
            <li>META_TOKEN_ENCRYPTION_KEY (any random 32+ char string)</li>
            <li>WHATSAPP_WEBHOOK_VERIFY_TOKEN (any random string — you'll enter it in the Meta App Dashboard webhook form)</li>
          </ul>
          <p className="text-graphite/60 mt-2 text-xs">
            Get META_APP_ID and META_APP_SECRET from{' '}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline inline-flex items-center gap-1"
            >
              developers.facebook.com/apps <ExternalLink size={10} />
            </a>{' '}
            → your app → Settings → Basic.
          </p>
        </div>
      )}

      {/* State 2: Not connected */}
      {status?.oauth_configured && !status.connected && (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-graphite/10 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-graphite/40" />
          </div>
          <p className="text-graphite/70 mb-4 text-sm max-w-md mx-auto">
            Connect your WhatsApp Business Account with one click. We'll automatically fetch your
            Business Account ID, phone number ID, and access token — and subscribe to incoming
            messages.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9A6B2F] via-[#C89B4E] to-[#F3D999] text-pearl px-6 py-3 rounded-full font-medium text-sm hover:brightness-110 transition-all shadow-lg shadow-gold/20"
          >
            <MessageCircle size={18} />
            Connect WhatsApp via Meta
          </button>
          <p className="text-xs text-graphite/40 mt-3">
            You'll be redirected to Facebook to authorize. Required permissions: whatsapp_business_management,
            whatsapp_business_messaging, business_management.
          </p>
        </div>
      )}

      {/* States 3-6: Connected */}
      {status?.connected && status.integration && (
        <ConnectedView
          integration={status.integration}
          onDisconnect={handleDisconnect}
          onReconnect={handleConnect}
          onSendTest={() => setShowTestForm(!showTestForm)}
          showTestForm={showTestForm}
          testPhone={testPhone}
          setTestPhone={setTestPhone}
          testMessage={testMessage}
          setTestMessage={setTestMessage}
          onSend={handleSendTest}
          sendingTest={sendingTest}
        />
      )}
    </div>
  );
}

function ConnectedView({
  integration,
  onDisconnect,
  onReconnect,
  onSendTest,
  showTestForm,
  testPhone,
  setTestPhone,
  testMessage,
  setTestMessage,
  onSend,
  sendingTest,
}: {
  integration: WhatsAppIntegration;
  onDisconnect: () => void;
  onReconnect: () => void;
  onSendTest: () => void;
  showTestForm: boolean;
  testPhone: string;
  setTestPhone: (s: string) => void;
  testMessage: string;
  setTestMessage: (s: string) => void;
  onSend: () => void;
  sendingTest: boolean;
}) {
  const expires = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
  const daysUntilExpiry = expires
    ? Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const lastMessage = integration.last_message_at ? new Date(integration.last_message_at) : null;

  const webhookStatusMap: Record<string, { color: string; label: string }> = {
    subscribed: { color: 'text-green-400', label: 'Webhook active' },
    partial: { color: 'text-yellow-400', label: 'Webhook partial' },
    pending: { color: 'text-yellow-400', label: 'Webhook pending' },
    failed: { color: 'text-red-400', label: 'Webhook failed' },
    not_configured: { color: 'text-graphite/50', label: 'Webhook not set up' },
  };
  const ws = webhookStatusMap[integration.webhook_status] || webhookStatusMap.not_configured;

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-4 pb-4 border-b border-graphite/10">
        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
          <MessageCircle size={24} className="text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-graphite truncate">{integration.verified_name}</p>
          <p className="text-xs text-graphite/60 truncate">
            {integration.display_phone_number}
          </p>
          <p className={`text-xs mt-0.5 ${ws.color}`}>{ws.label}</p>
        </div>
      </div>

      {/* Warning banners */}
      {integration.is_expired && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Token expired</p>
            <p className="text-xs mt-1">Click "Reconnect" to refresh your access.</p>
          </div>
        </div>
      )}
      {isExpiringSoon && !integration.is_expired && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Token expires soon ({daysUntilExpiry} days)</p>
            <p className="text-xs mt-1">Reconnect to avoid service interruption.</p>
          </div>
        </div>
      )}
      {(integration.webhook_status === 'failed' || integration.webhook_status === 'not_configured') && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-xs">
          <p className="font-medium mb-1">Webhook not receiving messages</p>
          <p>
            Make sure the callback URL is registered in your Meta App Dashboard:
            <br />
            <code className="bg-graphite/10 px-2 py-0.5 rounded text-[10px]">
              https://avetisyan-beauty.vercel.app/api/webhooks/whatsapp
            </code>
            <br />
            Verify token: the value of WHATSAPP_WEBHOOK_VERIFY_TOKEN env var (set on Vercel).
          </p>
        </div>
      )}
      {integration.last_error && !integration.is_expired && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
          <p className="font-medium mb-1">Last error:</p>
          <p className="font-mono break-all">{integration.last_error}</p>
        </div>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <MetaItem label="Phone Number ID" value={integration.whatsapp_phone_number_id} mono />
        <MetaItem label="WABA ID" value={integration.whatsapp_business_account_id} mono />
        <MetaItem label="Display number" value={integration.display_phone_number} />
        <MetaItem label="Verified name" value={integration.verified_name} />
        <MetaItem
          label="Token expires"
          value={expires ? expires.toLocaleDateString() : 'No expiry'}
        />
        <MetaItem
          label="Connected on"
          value={new Date(integration.created_at).toLocaleDateString()}
        />
        <MetaItem
          label="Last message sent"
          value={lastMessage ? lastMessage.toLocaleString() : 'Never'}
          className="col-span-2"
        />
        <MetaItem
          label="Permissions"
          value={(integration.granted_scopes || []).join(', ') || '—'}
          className="col-span-2"
        />
      </div>

      {/* Test message form */}
      {showTestForm && (
        <div className="bg-pearl/60 border border-graphite/10 rounded-xl p-4 space-y-3">
          <h5 className="text-sm font-medium text-graphite">Send a test message</h5>
          <div>
            <label className="block text-xs text-graphite/60 mb-1">Recipient phone (with country code)</label>
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+37433101077"
              className="w-full bg-pearl border border-graphite/10 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
            <p className="text-[10px] text-graphite/50 mt-1">
              Must include country code. The number must have an active WhatsApp account.
            </p>
          </div>
          <div>
            <label className="block text-xs text-graphite/60 mb-1">Message</label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={2}
              className="w-full bg-pearl border border-graphite/10 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none resize-none"
            />
          </div>
          <button
            onClick={onSend}
            disabled={sendingTest}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-pearl text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {sendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send test message
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={onSendTest}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-graphite text-white text-xs font-medium hover:bg-gold transition-colors"
        >
          <Send size={14} />
          {showTestForm ? 'Hide test form' : 'Send test message'}
        </button>
        <button
          onClick={onReconnect}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-graphite/20 text-graphite text-xs font-medium hover:border-gold hover:text-gold transition-colors"
        >
          <RotateCw size={14} />
          Reconnect
        </button>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors ml-auto"
        >
          <XCircle size={14} />
          Disconnect
        </button>
      </div>
    </div>
  );
}

function WhatsAppStatusPill({ integration }: { integration: WhatsAppIntegration }) {
  const isOk = !integration.is_expired && integration.webhook_status === 'subscribed';
  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
        isOk
          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
          : integration.is_expired
          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        isOk ? 'bg-green-500' : integration.is_expired ? 'bg-red-500' : 'bg-yellow-500'
      }`} />
      {isOk ? 'Active' : integration.is_expired ? 'Expired' : 'Attention'}
    </span>
  );
}

function MetaItem({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-graphite/50 uppercase tracking-wider text-[10px] mb-1">{label}</p>
      <p className={`text-graphite break-all ${mono ? 'font-mono text-[11px]' : 'text-xs'}`}>{value}</p>
    </div>
  );
}

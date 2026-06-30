import React, { useEffect, useState, useCallback } from 'react';
import { Instagram, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink, RotateCw } from 'lucide-react';

interface IntegrationInfo {
  id: string;
  facebook_page_id: string;
  facebook_page_name: string;
  instagram_account_id: string | null;
  instagram_username: string | null;
  instagram_profile_pic: string | null;
  token_type: string;
  token_expires_at: string | null;
  granted_scopes: string[];
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  is_expired: boolean;
}

interface StatusResponse {
  connected: boolean;
  oauth_configured: boolean;
  integration?: IntegrationInfo;
}

/**
 * InstagramOAuthSection — the recommended, one-click way to connect Instagram.
 *
 * Renders 5 visual states based on the server's /api/meta/oauth/status response:
 *   1. Not configured (META_APP_ID env not set) — shows setup instructions
 *   2. Not connected — primary "Connect Instagram" button
 *   3. Connected — username, account ID, page ID, expiry, Disconnect/Reconnect/Sync
 *   4. Token expired — warning + Reconnect button
 *   5. Error — last_error message + Reconnect button
 *
 * Also handles the redirect-back URL params from /api/meta/oauth/callback:
 *   ?meta_oauth=success  → toast + reload status
 *   ?meta_oauth=error&msg=...  → error toast
 */
export function InstagramOAuthSection() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/meta/oauth/status', { credentials: 'include' });
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error('Failed to load Instagram OAuth status:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    // Check URL params set by /api/meta/oauth/callback redirect
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get('meta_oauth');
    const msg = params.get('msg');
    if (oauthResult === 'success') {
      setToast({ kind: 'success', msg: 'Instagram connected successfully!' });
    } else if (oauthResult === 'error') {
      setToast({ kind: 'error', msg: msg || 'Instagram connection failed.' });
    }
    if (oauthResult) {
      // Clean the URL so the toast doesn't reappear on refresh
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
    // Auto-dismiss toast after 5s
    if (oauthResult) {
      setTimeout(() => setToast(null), 5000);
    }
  }, [refreshStatus]);

  const handleConnect = () => {
    // Full-page redirect to /api/meta/oauth/start, which redirects to Facebook
    window.location.href = '/api/meta/oauth/start';
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Instagram? You will need to reconnect to use the Instagram carousel and AI messaging.')) return;
    try {
      const res = await fetch('/api/meta/oauth/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setToast({ kind: 'info', msg: 'Instagram disconnected.' });
      setTimeout(() => setToast(null), 3000);
      refreshStatus();
    } catch (e: any) {
      setToast({ kind: 'error', msg: e.message });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setToast(null);
    try {
      const res = await fetch('/api/meta/sync-instagram', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setToast({ kind: 'success', msg: `Synced ${data.synced || 0} posts from Instagram.` });
      setTimeout(() => setToast(null), 4000);
      refreshStatus();
    } catch (e: any) {
      setToast({ kind: 'error', msg: e.message });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-graphite/60 text-sm py-4">
        <Loader2 size={16} className="animate-spin" /> Loading Instagram status...
      </div>
    );
  }

  return (
    <div className="bg-pearl/40 border border-graphite/10 rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-display text-lg text-graphite flex items-center gap-2">
            <Instagram size={20} className="text-gold" />
            Instagram via Meta Login
          </h4>
          <p className="text-xs text-graphite/60 mt-1">
            Recommended. One-click OAuth — no manual token copy-pasting.
          </p>
        </div>
        {status?.connected && status.integration && (
          <StatusPill connected={!status.integration.is_expired} />
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
          <span>{toast.msg}</span>
        </div>
      )}

      {/* State 1: OAuth not configured on server */}
      {status && !status.oauth_configured && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm">
          <p className="text-graphite/80 mb-2">
            <strong>Server not configured for Meta OAuth.</strong> The site administrator needs to
            set these environment variables on Vercel:
          </p>
          <ul className="list-disc list-inside text-graphite/70 space-y-1 font-mono text-xs">
            <li>META_APP_ID</li>
            <li>META_APP_SECRET</li>
            <li>META_REDIRECT_URI = https://avetisyan-beauty.vercel.app/api/meta/oauth/callback</li>
            <li>META_TOKEN_ENCRYPTION_KEY (any random 32+ char string)</li>
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
            <Instagram size={28} className="text-graphite/40" />
          </div>
          <p className="text-graphite/70 mb-4 text-sm max-w-md mx-auto">
            Connect your Instagram Business Account with one click. We'll automatically fetch your
            Page ID, Instagram Account ID, and access tokens — no manual copy-pasting required.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9A6B2F] via-[#C89B4E] to-[#F3D999] text-pearl px-6 py-3 rounded-full font-medium text-sm hover:brightness-110 transition-all shadow-lg shadow-gold/20"
          >
            <Instagram size={18} />
            Connect Instagram via Meta
          </button>
          <p className="text-xs text-graphite/40 mt-3">
            You'll be redirected to Facebook to authorize. We request only the minimum required
            permissions.
          </p>
        </div>
      )}

      {/* State 3, 4, 5: Connected (active, expired, or error) */}
      {status?.connected && status.integration && (
        <ConnectedView
          integration={status.integration}
          onDisconnect={handleDisconnect}
          onReconnect={handleConnect}
          onSync={handleSync}
          syncing={syncing}
        />
      )}
    </div>
  );
}

function ConnectedView({
  integration,
  onDisconnect,
  onReconnect,
  onSync,
  syncing,
}: {
  integration: IntegrationInfo;
  onDisconnect: () => void;
  onReconnect: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const expires = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
  const daysUntilExpiry = expires
    ? Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const lastSync = integration.last_sync_at ? new Date(integration.last_sync_at) : null;

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-4 pb-4 border-b border-graphite/10">
        {integration.instagram_profile_pic ? (
          <img
            src={integration.instagram_profile_pic}
            alt={integration.instagram_username || 'Instagram'}
            className="w-14 h-14 rounded-full object-cover border-2 border-gold/30"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-graphite/10 flex items-center justify-center">
            <Instagram size={24} className="text-graphite/40" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-graphite truncate">
            @{integration.instagram_username || 'unknown'}
          </p>
          <p className="text-xs text-graphite/60 truncate">
            Page: {integration.facebook_page_name}
          </p>
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
      {integration.last_error && !integration.is_expired && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
          <p className="font-medium mb-1">Last error:</p>
          <p className="font-mono break-all">{integration.last_error}</p>
        </div>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <MetaItem label="Instagram Account ID" value={integration.instagram_account_id || '—'} mono />
        <MetaItem label="Facebook Page ID" value={integration.facebook_page_id} mono />
        <MetaItem
          label="Token expires"
          value={expires ? expires.toLocaleDateString() : 'No expiry'}
        />
        <MetaItem
          label="Connected on"
          value={new Date(integration.created_at).toLocaleDateString()}
        />
        <MetaItem
          label="Last sync"
          value={lastSync ? lastSync.toLocaleString() : 'Never'}
          className="col-span-2"
        />
        <MetaItem
          label="Permissions"
          value={(integration.granted_scopes || []).join(', ') || '—'}
          className="col-span-2"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-graphite text-white text-xs font-medium hover:bg-gold transition-colors disabled:opacity-50"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Sync posts now
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

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
        connected
          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
          : 'bg-red-500/10 text-red-400 border border-red-500/30'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      {connected ? 'Active' : 'Expired'}
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

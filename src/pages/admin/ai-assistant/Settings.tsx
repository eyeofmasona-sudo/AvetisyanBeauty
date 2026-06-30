import React, { useState, useEffect } from 'react';
import { useAIAssistantStore } from '../../../store/aiAssistantStore';
import { MessageCircle, Instagram, ExternalLink, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings, metaCredentials, saveMetaCredentials } = useAIAssistantStore();

  return (
    <div className="space-y-10">
      {/* Connect WhatsApp & Instagram */}
      <MetaCredentialsSection
        metaCredentials={metaCredentials}
        onSave={saveMetaCredentials}
      />

      <div className="border-t border-graphite/10 pt-8">
        <h3 className="font-display text-xl text-graphite border-b border-graphite/10 pb-4 mb-6">
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-graphite">Enable AI Assistant</span>
                <input
                  type="checkbox"
                  checked={settings.is_enabled}
                  onChange={(e) => updateSettings({ is_enabled: e.target.checked })}
                  className="w-5 h-5 accent-gold"
                />
              </label>
              <p className="text-xs text-graphite/60">Turn on or off the AI auto-responses globally.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Operation Mode</label>
              <select
                value={settings.mode}
                onChange={(e) => updateSettings({ mode: e.target.value as any })}
                className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none"
              >
                <option value="draft_only">Draft Only (AI suggests, human copies)</option>
                <option value="approval_required">Approval Required (Human clicks 'Send')</option>
                <option value="auto_reply">Auto Reply (AI sends automatically if confident)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Working Hours</label>
              <input
                type="text"
                value={settings.working_hours}
                onChange={(e) => updateSettings({ working_hours: e.target.value })}
                className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none"
                placeholder="e.g. 10:00-20:00"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Fallback Message (EN)</label>
              <textarea
                value={settings.fallback_message_en}
                onChange={(e) => updateSettings({ fallback_message_en: e.target.value })}
                className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none h-20"
              />
              <p className="text-xs text-graphite/60 mt-1">Used when AI cannot answer or intent is human_required.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Fallback Message (RU)</label>
              <textarea
                value={settings.fallback_message_ru}
                onChange={(e) => updateSettings({ fallback_message_ru: e.target.value })}
                className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none h-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Fallback Message (HY)</label>
              <textarea
                value={settings.fallback_message_hy}
                onChange={(e) => updateSettings({ fallback_message_hy: e.target.value })}
                className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none h-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MetaCredentialsSection — the heart of the AI Assistant setup.
 *
 * Renders a step-by-step guide for connecting WhatsApp Business and Instagram
 * Messaging to the site, plus the form fields for entering the 7 credentials
 * the server needs to receive webhooks and send replies.
 *
 * Credentials are saved to public.site (key='meta_credentials') via the
 * admin-only /api/db/site/meta_credentials endpoint. The server reads them
 * at runtime via the service role key.
 */
function MetaCredentialsSection({
  metaCredentials,
  onSave,
}: {
  metaCredentials: ReturnType<typeof useAIAssistantStore.getState>['metaCredentials'];
  onSave: (creds: Partial<NonNullable<typeof metaCredentials>>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    meta_app_secret: '',
    meta_verify_token: '',
    whatsapp_verify_token: '',
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    instagram_account_id: '',
    instagram_page_access_token: '',
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // When the store loads metaCredentials from DB, populate the form.
  // Mask tokens (show only first/last 4 chars) so a glance at the screen
  // doesn't leak them.
  useEffect(() => {
    if (metaCredentials) {
      setForm({
        meta_app_secret: metaCredentials.meta_app_secret || '',
        meta_verify_token: metaCredentials.meta_verify_token || '',
        whatsapp_verify_token: metaCredentials.whatsapp_verify_token || '',
        whatsapp_phone_number_id: metaCredentials.whatsapp_phone_number_id || '',
        whatsapp_access_token: metaCredentials.whatsapp_access_token || '',
        instagram_account_id: metaCredentials.instagram_account_id || '',
        instagram_page_access_token: metaCredentials.instagram_page_access_token || '',
      });
    }
  }, [metaCredentials]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const mask = (s: string) => {
    if (!s || s.length < 12) return s;
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
  };

  const isWhatsAppConfigured = !!(form.whatsapp_phone_number_id && form.whatsapp_access_token);
  const isInstagramConfigured = !!(form.instagram_account_id && form.instagram_page_access_token);
  const isSignatureConfigured = !!form.meta_app_secret;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl text-graphite flex items-center gap-2">
            <MessageCircle className="text-gold" size={22} />
            Connect WhatsApp &amp; Instagram
          </h3>
          <p className="text-sm text-graphite/60 mt-1">
            Configure Meta API credentials so the AI Assistant can receive customer messages and
            reply automatically.
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatusBadge
          label="Signature verification"
          ok={isSignatureConfigured}
          okText="Configured"
          notOkText="Missing META_APP_SECRET"
        />
        <StatusBadge
          label="WhatsApp"
          ok={isWhatsAppConfigured}
          okText="Ready"
          notOkText="Not configured"
        />
        <StatusBadge
          label="Instagram"
          ok={isInstagramConfigured}
          okText="Ready"
          notOkText="Not configured"
        />
      </div>

      {/* Setup guide (collapsible) */}
      <div className="bg-pearl/40 border border-graphite/10 rounded-2xl mb-6">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="font-medium text-graphite flex items-center gap-2">
            <AlertCircle size={18} className="text-gold" />
            Step-by-step setup guide
          </span>
          {guideOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {guideOpen && (
          <div className="px-4 pb-4 space-y-4 text-sm text-graphite/80">
            <GuideStep n={1} title="Create a Meta Business Account">
              Go to{' '}
              <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gold underline inline-flex items-center gap-1">
                business.facebook.com <ExternalLink size={12} />
              </a>{' '}
              → Create Account. Use your clinic name. This is required to access Meta APIs.
            </GuideStep>
            <GuideStep n={2} title="Create a Meta App">
              Go to{' '}
              <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-gold underline inline-flex items-center gap-1">
                developers.facebook.com/apps <ExternalLink size={12} />
              </a>{' '}
              → Create App → Business type. Add products: <strong>WhatsApp Business API</strong> and{' '}
              <strong>Webhooks</strong>.
            </GuideStep>
            <GuideStep n={3} title="Get your META_APP_SECRET">
              In your App Dashboard → <em>Settings → Basic</em> → <em>App Secret</em> → click "Show"
              → copy. Paste it in the <strong>META_APP_SECRET</strong> field below.
            </GuideStep>
            <GuideStep n={4} title="Get WhatsApp credentials">
              In App Dashboard → <em>WhatsApp → API Setup</em>:
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Copy <strong>Phone Number ID</strong> → paste to <strong>WHATSAPP_PHONE_NUMBER_ID</strong></li>
                <li>Generate permanent access token (System User in Business Manager) → paste to <strong>WHATSAPP_ACCESS_TOKEN</strong></li>
              </ul>
            </GuideStep>
            <GuideStep n={5} title="Register the WhatsApp webhook">
              In App Dashboard → <em>WhatsApp → Configuration</em>:
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>
                  <strong>Callback URL</strong>:
                  <code className="bg-graphite/10 px-2 py-0.5 rounded ml-1 select-all">
                    https://avetisyan-beauty.vercel.app/api/webhooks/whatsapp
                  </code>
                  <button
                    onClick={() => copyToClipboard('https://avetisyan-beauty.vercel.app/api/webhooks/whatsapp', 'wa-cb')}
                    className="ml-1 text-gold"
                    type="button"
                  >
                    {copied === 'wa-cb' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </li>
                <li>
                  <strong>Verify Token</strong>: invent any string (e.g.{' '}
                  <code className="bg-graphite/10 px-2 py-0.5 rounded">avetisyan_wa_2026</code>) and
                  paste the same value in the <strong>WHATSAPP_VERIFY_TOKEN</strong> field below
                </li>
                <li>Click <em>Verify and Save</em>, then subscribe to the <code>messages</code> field</li>
              </ul>
            </GuideStep>
            <GuideStep n={6} title="Switch Instagram to Business & link to FB Page">
              In Instagram app → Settings → Account type and tools → <em>Switch to Professional
              Account → Business</em>. Link it to your Facebook Page.
            </GuideStep>
            <GuideStep n={7} title="Get Instagram credentials">
              In your Meta App → add product <strong>Instagram</strong>. Then use the{' '}
              <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-gold underline inline-flex items-center gap-1">
                Graph API Explorer <ExternalLink size={12} />
              </a>{' '}
              to generate a Page Access Token with permissions:{' '}
              <code>pages_manage_metadata</code>, <code>pages_read_engagement</code>,{' '}
              <code>instagram_basic</code>, <code>instagram_manage_messages</code>.
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Copy Instagram Business Account ID → <strong>INSTAGRAM_ACCOUNT_ID</strong></li>
                <li>Copy Page Access Token → <strong>INSTAGRAM_PAGE_ACCESS_TOKEN</strong></li>
              </ul>
            </GuideStep>
            <GuideStep n={8} title="Register the Instagram webhook">
              In App Dashboard → <em>Webhooks</em>:
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>
                  <strong>Callback URL</strong>:
                  <code className="bg-graphite/10 px-2 py-0.5 rounded ml-1 select-all">
                    https://avetisyan-beauty.vercel.app/api/webhooks/instagram
                  </code>
                  <button
                    onClick={() => copyToClipboard('https://avetisyan-beauty.vercel.app/api/webhooks/instagram', 'ig-cb')}
                    className="ml-1 text-gold"
                    type="button"
                  >
                    {copied === 'ig-cb' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </li>
                <li>
                  <strong>Verify Token</strong>: invent any string (e.g.{' '}
                  <code className="bg-graphite/10 px-2 py-0.5 rounded">avetisyan_ig_2026</code>) and
                  paste the same value in the <strong>META_VERIFY_TOKEN</strong> field below
                </li>
                <li>Subscribe to the <code>messages</code> field</li>
              </ul>
            </GuideStep>
            <GuideStep n={9} title="Save and enable">
              Click <strong>Save Credentials</strong> below. Then go to "General Settings" above,
              toggle <em>Enable AI Assistant</em> on, and pick an operation mode (start with{' '}
              <em>Approval Required</em>).
            </GuideStep>
            <p className="text-xs text-graphite/50 pt-2 border-t border-graphite/10">
              ⚠️ <strong>Also required on Vercel:</strong> Set the env var{' '}
              <code className="bg-graphite/10 px-1 py-0.5 rounded">AI_ASSISTANT_ENABLED=true</code> in
              your Vercel project settings. Without this, webhooks return 200 but do nothing.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* Credentials form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="META_APP_SECRET"
          hint="Used to verify incoming webhook signatures. App Dashboard → Settings → Basic → App Secret."
          value={form.meta_app_secret}
          onChange={(v) => setForm({ ...form, meta_app_secret: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
        <Field
          label="META_VERIFY_TOKEN"
          hint="Any string you invent. Must match what you enter in the Instagram webhook subscription form."
          value={form.meta_verify_token}
          onChange={(v) => setForm({ ...form, meta_verify_token: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
        <Field
          label="WHATSAPP_VERIFY_TOKEN"
          hint="Any string you invent. Must match what you enter in the WhatsApp webhook subscription form."
          value={form.whatsapp_verify_token}
          onChange={(v) => setForm({ ...form, whatsapp_verify_token: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
        <Field
          label="WHATSAPP_PHONE_NUMBER_ID"
          hint="App Dashboard → WhatsApp → API Setup → Phone Number ID."
          value={form.whatsapp_phone_number_id}
          onChange={(v) => setForm({ ...form, whatsapp_phone_number_id: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
        <Field
          label="WHATSAPP_ACCESS_TOKEN"
          hint="Permanent token from Business Manager → System Users. Don't use the 24h temporary token."
          value={form.whatsapp_access_token}
          onChange={(v) => setForm({ ...form, whatsapp_access_token: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
        <Field
          label="INSTAGRAM_ACCOUNT_ID"
          hint="Instagram Business Account ID linked to your Facebook Page."
          value={form.instagram_account_id}
          onChange={(v) => setForm({ ...form, instagram_account_id: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
        <Field
          label="INSTAGRAM_PAGE_ACCESS_TOKEN"
          hint="Page Access Token with instagram_manage_messages permission (long-lived)."
          value={form.instagram_page_access_token}
          onChange={(v) => setForm({ ...form, instagram_page_access_token: v })}
          showSecrets={showSecrets}
          mask={mask}
        />
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-graphite/10">
        <label className="flex items-center gap-2 text-sm text-graphite/70 cursor-pointer">
          <input
            type="checkbox"
            checked={showSecrets}
            onChange={(e) => setShowSecrets(e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          Show full token values
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gold text-white hover:bg-gold/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : savedAt ? <><Check size={16} /> Saved!</> : 'Save Credentials'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  showSecrets,
  mask,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  showSecrets: boolean;
  mask: (s: string) => string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono font-medium text-gold uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={showSecrets ? 'text' : 'password'}
        value={showSecrets ? value : (value ? mask(value) : '')}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          // When user focuses a masked field, reveal the real value temporarily
          // by switching to text type. Otherwise they can't edit.
          if (!showSecrets && value) {
            e.target.type = 'text';
          }
        }}
        onBlur={(e) => {
          if (!showSecrets) e.target.type = 'password';
        }}
        placeholder="Paste value here..."
        className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-gold focus:outline-none"
      />
      <p className="text-xs text-graphite/50 mt-1">{hint}</p>
    </div>
  );
}

function StatusBadge({
  label,
  ok,
  okText,
  notOkText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  notOkText: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border ${
        ok
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-graphite/10 border-graphite/20 text-graphite/60'
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-graphite/40'}`} />
      <span className="font-mono uppercase tracking-wider">{label}</span>
      <span className="opacity-70">· {ok ? okText : notOkText}</span>
    </div>
  );
}

function GuideStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-medium">
        {n}
      </div>
      <div className="flex-1">
        <p className="font-medium text-graphite mb-1">{title}</p>
        <div className="text-graphite/70">{children}</div>
      </div>
    </div>
  );
}

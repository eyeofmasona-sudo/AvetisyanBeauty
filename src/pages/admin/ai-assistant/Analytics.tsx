import React, { useMemo } from 'react';
import { BarChart3, MessageCircle, CheckCircle, Clock, AlertCircle, TrendingUp, Send } from 'lucide-react';
import { useAIAssistantStore } from '../../../store/aiAssistantStore';

export function Analytics() {
  const { threads, knowledgeBase, templates } = useAIAssistantStore();

  // Compute stats from local threads state (which is kept fresh via Realtime).
  const stats = useMemo(() => {
    const allMessages = threads.flatMap((t) => t.messages);
    const inbound = allMessages.filter((m) => m.direction === 'inbound');
    const outbound = allMessages.filter((m) => m.direction === 'outbound');
    const answered = allMessages.filter((m) => m.status === 'answered');
    const needsHuman = allMessages.filter((m) => m.status === 'needs_human');
    const newMsgs = allMessages.filter((m) => m.status === 'new');

    const byChannel = {
      whatsapp: threads.filter((t) => t.channel === 'whatsapp').length,
      instagram: threads.filter((t) => t.channel === 'instagram').length,
    };

    // Average AI confidence (rounded %), only on messages that have a value.
    const confidences = inbound
      .map((m) => m.confidence)
      .filter((c): c is number => typeof c === 'number');
    const avgConfidence =
      confidences.length > 0
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
        : null;

    // Response rate = outbound / inbound (how many customer messages got a reply).
    const responseRate =
      inbound.length > 0 ? Math.round((outbound.length / inbound.length) * 100) : null;

    // Last 7 days activity (simple histogram by day).
    const now = Date.now();
    const days = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;
      const count = allMessages.filter(
        (m) => m.created_at >= dayStart.getTime() && m.created_at < dayEnd
      ).length;
      return {
        label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      };
    });

    const maxDayCount = Math.max(...days.map((d) => d.count), 1);

    return {
      totalThreads: threads.length,
      totalMessages: allMessages.length,
      inbound: inbound.length,
      outbound: outbound.length,
      answered: answered.length,
      needsHuman: needsHuman.length,
      newMsgs: newMsgs.length,
      byChannel,
      avgConfidence,
      responseRate,
      days,
      maxDayCount,
    };
  }, [threads]);

  const cardClass = 'bg-pearl/50 border border-graphite/10 rounded-2xl p-5';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl text-graphite">Analytics</h3>
        <p className="text-sm text-graphite/60 mt-1">
          Real-time overview of AI assistant activity. Updates automatically as new messages arrive.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<MessageCircle size={20} />}
          label="Total threads"
          value={stats.totalThreads}
          subtitle={`${stats.byChannel.whatsapp} WhatsApp · ${stats.byChannel.instagram} Instagram`}
        />
        <MetricCard
          icon={<Send size={20} />}
          label="Messages sent"
          value={stats.outbound}
          subtitle={`${stats.inbound} received`}
        />
        <MetricCard
          icon={<CheckCircle size={20} />}
          label="Answered"
          value={stats.answered}
          subtitle={`${stats.responseRate !== null ? `${stats.responseRate}% response rate` : '—'}`}
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Needs human"
          value={stats.needsHuman}
          subtitle={`${stats.newMsgs} new`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-day activity histogram */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gold" />
            <h4 className="font-medium text-graphite">Activity (last 7 days)</h4>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[32px] bg-gradient-to-t from-gold/60 to-gold rounded-t-lg transition-all"
                    style={{
                      height: `${(d.count / stats.maxDayCount) * 100}%`,
                      minHeight: d.count > 0 ? '8px' : '2px',
                      opacity: d.count > 0 ? 1 : 0.2,
                    }}
                    title={`${d.count} messages`}
                  />
                </div>
                <span className="text-xs text-graphite/60">{d.label}</span>
                <span className="text-xs text-graphite/40">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI confidence */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-gold" />
            <h4 className="font-medium text-graphite">AI Confidence</h4>
          </div>
          {stats.avgConfidence !== null ? (
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display text-4xl text-graphite">{stats.avgConfidence}%</span>
                <span className="text-sm text-graphite/60">average across {stats.inbound} inbound</span>
              </div>
              <div className="w-full bg-pearl rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all"
                  style={{ width: `${stats.avgConfidence}%` }}
                />
              </div>
              <p className="text-xs text-graphite/50 mt-2">
                Threshold for auto-reply: 75%. Below this, messages wait in Inbox for manual review.
              </p>
            </div>
          ) : (
            <div className="text-graphite/50 text-sm py-4 text-center">
              No inbound messages yet.
            </div>
          )}
        </div>
      </div>

      {/* Knowledge base & templates summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-gold" />
            <h4 className="font-medium text-graphite">Knowledge Base</h4>
          </div>
          <p className="font-display text-3xl text-graphite">{knowledgeBase.length}</p>
          <p className="text-xs text-graphite/60 mt-1">
            {knowledgeBase.filter((k) => k.is_active).length} active ·{' '}
            {knowledgeBase.filter((k) => k.requires_human_review).length} require human review
          </p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={18} className="text-gold" />
            <h4 className="font-medium text-graphite">Reply Templates</h4>
          </div>
          <p className="font-display text-3xl text-graphite">{templates.length}</p>
          <p className="text-xs text-graphite/60 mt-1">
            {templates.filter((t) => t.is_active).length} active intents configured
          </p>
        </div>
      </div>

      {stats.totalThreads === 0 && (
        <div className="text-center py-12 text-graphite/50 bg-pearl/30 rounded-2xl border border-dashed border-graphite/10">
          <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1 max-w-md mx-auto">
            Once your WhatsApp/Instagram webhooks start receiving messages from customers, you'll
            see live stats here. See the Settings tab → "Connect WhatsApp &amp; Instagram" to set up
            webhooks.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-pearl/50 border border-graphite/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-gold mb-2">{icon}</div>
      <p className="font-display text-3xl text-graphite leading-none">{value}</p>
      <p className="text-xs font-medium text-graphite/70 uppercase tracking-wider mt-2">{label}</p>
      {subtitle && <p className="text-xs text-graphite/50 mt-1">{subtitle}</p>}
    </div>
  );
}

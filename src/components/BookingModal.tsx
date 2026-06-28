import React, { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "./AnalyticsProvider";
import { useSettingsStore } from "../store/settingsStore";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { t, i18n } = useTranslation();
  const { settings } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { trackBookingInitiation, trackEvent } = useAnalytics();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && step === 1) {
      trackEvent('Booking Modal Opened');
    }
  }, [isOpen, step, trackEvent]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstWeekday = viewDate.getDay(); // 0 = Sunday
  const startDay = (firstWeekday + 6) % 7; // Monday-first offset
  const monthName = viewDate.toLocaleDateString(i18n.language, { month: "long", year: "numeric" });

  const resetAndClose = () => {
    onClose();
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleConfirm = () => {
    trackEvent('Booking Confirmed', { category: selectedCategory });

    const dateLabel = selectedDate
      ? selectedDate.toLocaleDateString(i18n.language, { day: "numeric", month: "long", year: "numeric" })
      : "";
    const lines = [
      t("booking.whatsappIntro", "New booking request:"),
      `${t("booking.serviceTitle", "Service")}: ${selectedCategory || ""}`,
      `${t("booking.dateTimeTitle")}: ${dateLabel} ${selectedTime || ""}`,
      `${t("booking.namePlace")}: ${name}`,
      `${t("booking.phonePlace")}: ${phone}`,
    ];
    if (email) lines.push(`${t("booking.emailPlace")}: ${email}`);

    const cleanNumber = settings?.whatsappNumber?.replace(/[^\d+]/g, '') || '+37433101077';
    const finalNumber = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
    const waUrl = `https://wa.me/${finalNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    resetAndClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-graphite/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl h-full md:h-auto bg-white md:rounded-[2rem] border border-graphite/10 z-50 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-graphite/5 bg-pearl/50">
              <div>
                <h3 id={titleId} className="font-display text-2xl text-graphite">
                  {t("booking.title")}
                </h3>
                <p className="text-graphite/40 text-sm mt-1">
                  {t("booking.step", { current: step, total: 3 })}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label={t("booking.closeBtn", "Close")}
                className="w-10 h-10 rounded-full bg-graphite/5 flex items-center justify-center text-graphite/60 hover:text-graphite hover:bg-graphite/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h4 className="text-graphite text-xs font-medium uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Star size={14} className="text-gold" />
                      Priority Services
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setSelectedCategory("Ultraformer III");
                          trackBookingInitiation("Ultraformer III");
                          setStep(2);
                        }}
                        className="relative overflow-hidden group p-5 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-pearl hover:from-gold/20 hover:to-gold/5 transition-all flex flex-col items-start text-left"
                      >
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gold mb-2">{t("goldensun.badge", "Featured")}</span>
                        <span className="font-display text-lg text-graphite mb-1">Ultraformer III</span>
                        <span className="text-graphite/60 text-xs">SMAS Anti-Age Lifting</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gold group-hover:scale-110 transition-transform">
                          <ChevronRight size={16} />
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCategory("Golden Sun");
                          trackBookingInitiation("Golden Sun");
                          setStep(2);
                        }}
                        className="relative overflow-hidden group p-5 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-pearl hover:from-gold/20 hover:to-gold/5 transition-all flex flex-col items-start text-left"
                      >
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gold mb-2">{t("goldensun.badge", "Featured")}</span>
                        <span className="font-display text-lg text-graphite mb-1">Golden Sun</span>
                        <span className="text-graphite/60 text-xs">Radiant Skin Treatment</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gold group-hover:scale-110 transition-transform">
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-graphite text-xs font-medium uppercase tracking-widest mb-4">
                      {t("booking.serviceTitle", "Standard Categories")}
                    </h4>
                    <div className="space-y-3">
                      {[
                        t("booking.cats.face"),
                        t("booking.cats.body"),
                        t("booking.cats.inject"),
                        t("booking.cats.skin"),
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            trackBookingInitiation(cat);
                            setStep(2);
                          }}
                          className="w-full group p-4 rounded-xl border border-graphite/10 bg-pearl hover:bg-white hover:border-gold hover:shadow-sm transition-all flex justify-between items-center text-left"
                        >
                          <span className="text-graphite font-medium text-sm">{cat}</span>
                          <ChevronRight
                            size={16}
                            className="text-graphite/30 group-hover:text-gold"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h4 className="text-graphite text-lg font-medium mb-4">
                    {t("booking.dateTimeTitle")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-pearl rounded-2xl border border-graphite/10 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <button
                          type="button"
                          onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
                          disabled={monthOffset === 0}
                          aria-label={t("booking.prevMonth", "Previous month")}
                          className="p-2 hover:bg-graphite/5 rounded-full transition-colors text-graphite/60 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={20}/>
                        </button>
                        <span className="font-medium text-graphite capitalize">{monthName}</span>
                        <button
                          type="button"
                          onClick={() => setMonthOffset((m) => m + 1)}
                          aria-label={t("booking.nextMonth", "Next month")}
                          className="p-2 hover:bg-graphite/5 rounded-full transition-colors text-graphite/60"
                        >
                          <ChevronRight size={20}/>
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                          <div key={day} className="text-center text-xs font-medium text-graphite/40">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: startDay }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
                          const isSelected = selectedDate?.getTime() === cellDate.getTime();
                          const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                if (isPast) return;
                                setSelectedDate(cellDate);
                                setSelectedTime(null);
                              }}
                              disabled={isPast}
                              aria-pressed={isSelected}
                              className={`aspect-square flex items-center justify-center rounded-full text-sm transition-colors ${
                                isSelected
                                  ? 'bg-gold text-white shadow-md'
                                  : isPast
                                    ? 'text-graphite/20 cursor-not-allowed'
                                    : 'text-graphite hover:bg-gold/10 hover:text-gold'
                              }`}
                            >
                              {dayNum}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-graphite/60 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Clock size={16} />
                        {t("booking.availableTimes")}
                      </p>

                      {selectedDate ? (
                        <div className="grid grid-cols-2 gap-3">
                          {["10:00", "11:30", "14:00", "16:15", "17:30", "18:45"].map(
                            (time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(time);
                                  setStep(3);
                                }}
                                className="p-3 rounded-xl border border-graphite/10 bg-pearl hover:bg-gold hover:text-white hover:border-gold hover:shadow-md transition-all text-graphite text-center font-medium text-sm"
                              >
                                {time}
                              </button>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-graphite/40 min-h-[200px] border border-dashed border-graphite/20 rounded-2xl">
                          <Calendar size={32} className="mb-2 opacity-50" />
                          <p className="text-sm">Select a date first</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h4 className="text-graphite text-lg font-medium mb-4">
                    {t("booking.detailsTitle")}
                  </h4>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConfirm();
                    }}
                  >
                    <div>
                      <label htmlFor={`${titleId}-name`} className="sr-only">{t("booking.namePlace")}</label>
                      <input
                        id={`${titleId}-name`}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("booking.namePlace")}
                        className="w-full bg-pearl border border-graphite/10 rounded-xl px-6 py-4 text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold focus:bg-white transition-colors shadow-inner"
                      />
                    </div>
                    <div>
                      <label htmlFor={`${titleId}-email`} className="sr-only">{t("booking.emailPlace")}</label>
                      <input
                        id={`${titleId}-email`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("booking.emailPlace")}
                        className="w-full bg-pearl border border-graphite/10 rounded-xl px-6 py-4 text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold focus:bg-white transition-colors shadow-inner"
                      />
                    </div>
                    <div>
                      <label htmlFor={`${titleId}-phone`} className="sr-only">{t("booking.phonePlace")}</label>
                      <input
                        id={`${titleId}-phone`}
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("booking.phonePlace")}
                        className="w-full bg-pearl border border-graphite/10 rounded-xl px-6 py-4 text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold focus:bg-white transition-colors shadow-inner"
                      />
                    </div>

                    <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex justify-between items-center text-sm">
                      <span className="text-graphite/60">Selected Service:</span>
                      <span className="font-medium text-graphite">{selectedCategory}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 bg-graphite text-white font-medium rounded-xl px-6 py-4 hover:bg-gold transition-colors shadow-md"
                    >
                      {t("booking.confirmBtn")}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {step > 1 && (
               <div className="p-6 md:p-8 border-t border-graphite/5 bg-pearl/50">
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-graphite/60 hover:text-graphite transition-colors text-sm font-medium uppercase tracking-widest"
                >
                  {t("booking.backBtn")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

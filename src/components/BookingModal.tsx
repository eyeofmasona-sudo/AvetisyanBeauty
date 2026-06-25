import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "./AnalyticsProvider";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const { trackBookingInitiation, trackEvent } = useAnalytics();

  useEffect(() => {
    if (isOpen && step === 1) {
      trackEvent('Booking Modal Opened');
    }
  }, [isOpen, step, trackEvent]);

  // Calendar logic
  const daysInMonth = 31;
  const startDay = 3; // Let's say Wednesday is the 1st
  const monthName = "October 2024";

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
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl h-full md:h-auto bg-white md:rounded-[2rem] border border-graphite/10 z-50 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-graphite/5 bg-pearl/50">
              <div>
                <h3 className="font-display text-2xl text-graphite">
                  {t("booking.title")}
                </h3>
                <p className="text-graphite/40 text-sm mt-1">
                  {t("booking.step", { current: step, total: 3 })}
                </p>
              </div>
              <button
                onClick={onClose}
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
                        <div
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            trackBookingInitiation(cat);
                            setStep(2);
                          }}
                          className="group p-4 rounded-xl border border-graphite/10 bg-pearl hover:bg-white hover:border-gold hover:shadow-sm cursor-pointer transition-all flex justify-between items-center"
                        >
                          <span className="text-graphite font-medium text-sm">{cat}</span>
                          <ChevronRight
                            size={16}
                            className="text-graphite/30 group-hover:text-gold"
                          />
                        </div>
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
                        <button className="p-2 hover:bg-graphite/5 rounded-full transition-colors text-graphite/60"><ChevronLeft size={20}/></button>
                        <span className="font-medium text-graphite">{monthName}</span>
                        <button className="p-2 hover:bg-graphite/5 rounded-full transition-colors text-graphite/60"><ChevronRight size={20}/></button>
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
                          const isSelected = selectedDate === dayNum;
                          const isPast = dayNum < 15; // Just a mock condition
                          return (
                            <button 
                              key={i} 
                              onClick={() => !isPast && setSelectedDate(dayNum)}
                              disabled={isPast}
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
                              <div
                                key={time}
                                onClick={() => setStep(3)}
                                className="p-3 rounded-xl border border-graphite/10 bg-pearl hover:bg-gold hover:text-white hover:border-gold hover:shadow-md cursor-pointer transition-all text-graphite text-center font-medium text-sm"
                              >
                                {time}
                              </div>
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
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t("booking.namePlace")}
                      className="w-full bg-pearl border border-graphite/10 rounded-xl px-6 py-4 text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold focus:bg-white transition-colors shadow-inner"
                    />
                    <input
                      type="email"
                      placeholder={t("booking.emailPlace")}
                      className="w-full bg-pearl border border-graphite/10 rounded-xl px-6 py-4 text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold focus:bg-white transition-colors shadow-inner"
                    />
                    <input
                      type="tel"
                      placeholder={t("booking.phonePlace")}
                      className="w-full bg-pearl border border-graphite/10 rounded-xl px-6 py-4 text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold focus:bg-white transition-colors shadow-inner"
                    />
                    
                    <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex justify-between items-center text-sm">
                      <span className="text-graphite/60">Selected Service:</span>
                      <span className="font-medium text-graphite">{selectedCategory}</span>
                    </div>

                    <button
                      onClick={() => {
                        trackEvent('Booking Confirmed', { category: selectedCategory });
                        alert(t("booking.success"));
                        onClose();
                        setStep(1);
                        setSelectedDate(null);
                      }}
                      className="w-full mt-4 bg-graphite text-white font-medium rounded-xl px-6 py-4 hover:bg-gold transition-colors shadow-md"
                    >
                      {t("booking.confirmBtn")}
                    </button>
                  </div>
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


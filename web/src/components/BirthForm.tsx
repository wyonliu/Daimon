'use client';

import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

interface BirthFormProps {
  onSubmit: (data: { year: number; month: number; day: number; hour: number | null; name: string; gender: 'male' | 'female' }) => void;
  loading: boolean;
}

export default function BirthForm({ onSubmit, loading }: BirthFormProps) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [showHour, setShowHour] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const getDaysInMonth = () => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    const label = `${String(i).padStart(2, '0')}:00`;
    const shichen = ['\u5b50', '\u4e11', '\u4e11', '\u5bc5', '\u5bc5', '\u536f', '\u536f', '\u8fb0', '\u8fb0', '\u5df3', '\u5df3', '\u5348', '\u5348', '\u672a', '\u672a', '\u7533', '\u7533', '\u9149', '\u9149', '\u620c', '\u620c', '\u4ea5', '\u4ea5', '\u5b50'];
    return { value: i, label: `${label} (${shichen[i]}\u6642)` };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day) return;
    onSubmit({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: hour ? parseInt(hour) : null,
      name: name || 'Seeker',
      gender,
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6 slide-up">
      {/* Name */}
      <div>
        <label className="block text-sm text-gold-500 mb-2 font-medium">
          {t('form.name')} <span className="text-gray-500">{t('form.name.optional')}</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('form.name.placeholder')}
          className="w-full bg-void-lighter border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors"
        />
      </div>

      {/* Gender — needed for DaYun direction */}
      <div>
        <label className="block text-sm text-gold-500 mb-2 font-medium">
          {t('form.gender')} <span className="text-gray-500 text-xs">{t('form.gender.note')}</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border press-effect ${
              gender === 'male'
                ? 'bg-gold-500/10 border-gold-500/40 text-gold-500 shadow-[0_0_10px_rgba(200,169,110,0.1)]'
                : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {t('form.gender.male')}
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border press-effect ${
              gender === 'female'
                ? 'bg-gold-500/10 border-gold-500/40 text-gold-500 shadow-[0_0_10px_rgba(200,169,110,0.1)]'
                : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {t('form.gender.female')}
          </button>
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm text-gold-500 mb-2 font-medium">
          {t('form.dob')} <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div className="select-premium">
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); if (day && e.target.value && month && parseInt(day) > new Date(parseInt(e.target.value), parseInt(month), 0).getDate()) setDay(''); }}
              onBlur={() => markTouched('year')}
              required
              className={`w-full bg-void-lighter border rounded-lg px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all duration-200 appearance-none cursor-pointer input-glow ${
                touched.year && !year ? 'border-red-500/50' : 'border-gray-700'
              }`}
            >
              <option value="">{t('form.year')}</option>
              {Array.from({ length: 100 }, (_, i) => currentYear - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="select-premium">
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value); if (day && year && e.target.value && parseInt(day) > new Date(parseInt(year), parseInt(e.target.value), 0).getDate()) setDay(''); }}
              onBlur={() => markTouched('month')}
              required
              className={`w-full bg-void-lighter border rounded-lg px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all duration-200 appearance-none cursor-pointer input-glow ${
                touched.month && !month ? 'border-red-500/50' : 'border-gray-700'
              }`}
            >
              <option value="">{t('form.month')}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div className="select-premium">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              onBlur={() => markTouched('day')}
              required
              className={`w-full bg-void-lighter border rounded-lg px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all duration-200 appearance-none cursor-pointer input-glow ${
                touched.day && !day ? 'border-red-500/50' : 'border-gray-700'
              }`}
            >
              <option value="">{t('form.day')}</option>
              {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Birth Hour Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowHour(!showHour)}
          className="text-sm text-gray-400 hover:text-gold-500 transition-colors flex items-center gap-2"
        >
          <svg className={`w-4 h-4 transition-transform ${showHour ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t('form.hour.toggle')}
        </button>

        {showHour && (
          <div className="mt-3 fade-in">
            <label className="block text-sm text-gold-500 mb-2 font-medium">
              {t('form.hour')} {t('form.hour.shichen') && <span className="text-gray-500">{t('form.hour.shichen')}</span>}
            </label>
            <div className="select-premium"><select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full bg-void-lighter border border-gray-700 rounded-lg px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors appearance-none cursor-pointer input-glow"
            >
              <option value="">{t('form.hour.unknown')}</option>
              {hours.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select></div>
            <p className="text-xs text-gray-500 mt-1">
              {t('form.hour.note')}
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !year || !month || !day}
        className="w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void glow-gold-soft hover:glow-gold press-effect btn-shimmer"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block"></span>
            <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block"></span>
            <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block"></span>
          </span>
        ) : (
          t('form.submit')
        )}
      </button>

      <p className="text-center text-xs text-gray-600 tracking-wide">
        {t('form.privacy')}
      </p>
    </form>
  );
}

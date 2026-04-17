import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

interface DatePresetFilterProps {
  value: string;
  onChange: (preset: string) => void;
}

export function DatePresetFilter({ value, onChange }: DatePresetFilterProps) {
  const { t } = useTranslation();

  const presets = [
    { key: 'today', label: t('datePresets.today') },
    { key: 'yesterday', label: t('datePresets.yesterday') },
    { key: 'thisWeek', label: t('datePresets.thisWeek') },
    { key: 'thisMonth', label: t('datePresets.thisMonth') },
    { key: 'lastMonth', label: t('datePresets.lastMonth') },
    { key: 'firstQuarter', label: t('datePresets.firstQuarter') },
    { key: 'secondQuarter', label: t('datePresets.secondQuarter') },
    { key: 'sixMonths', label: t('datePresets.sixMonths') },
    { key: 'thisYear', label: t('datePresets.thisYear') },
    { key: 'lastYear', label: t('datePresets.lastYear') },
    { key: 'all', label: t('datePresets.all') },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm rounded-sm border border-border bg-transparent text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
      >
        {presets.map((preset) => (
          <option key={preset.key} value={preset.key}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Helper function to get date range from preset
export function getDateRangeFromPreset(preset: string): { startDate: string; endDate: string } {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  switch (preset) {
    case 'today': {
      return { startDate: todayStr, endDate: todayStr };
    }
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return { startDate: yesterdayStr, endDate: yesterdayStr };
    }
    case 'thisWeek': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return { startDate: startOfWeek.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'thisMonth': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: startOfMonth.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'lastMonth': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: startOfLastMonth.toISOString().split('T')[0], endDate: endOfLastMonth.toISOString().split('T')[0] };
    }
    case 'firstQuarter': {
      const startOfQuarter = new Date(today.getFullYear(), 0, 1);
      const endOfQuarter = new Date(today.getFullYear(), 2, 31);
      return { startDate: startOfQuarter.toISOString().split('T')[0], endDate: endOfQuarter.toISOString().split('T')[0] };
    }
    case 'secondQuarter': {
      const startOfQuarter = new Date(today.getFullYear(), 3, 1);
      const endOfQuarter = new Date(today.getFullYear(), 5, 30);
      return { startDate: startOfQuarter.toISOString().split('T')[0], endDate: endOfQuarter.toISOString().split('T')[0] };
    }
    case 'sixMonths': {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return { startDate: sixMonthsAgo.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'thisYear': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { startDate: startOfYear.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'lastYear': {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
      return { startDate: startOfLastYear.toISOString().split('T')[0], endDate: endOfLastYear.toISOString().split('T')[0] };
    }
    case 'all':
    default:
      return { startDate: '', endDate: '' };
  }
}

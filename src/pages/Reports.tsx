import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Download, Calendar, Users, Briefcase, Wallet, Receipt, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DatePresetFilter, getDateRangeFromPreset } from '../components/ui/DatePresetFilter';
import { useContributionStore } from '../stores/contributionStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useArtisanStore } from '../stores/artisanStore';
import { useTradeStore } from '../stores/tradeStore';
import { formatCurrency } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface MonthlyData {
  month: string;
  contributions: number;
  expenses: number;
  balance: number;
}

interface ArtisanContribution {
  name: string;
  total: number;
}

export function Reports() {
  const { t } = useTranslation();
  const { contributions, fetchContributions } = useContributionStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { artisans, fetchArtisans } = useArtisanStore();
  const { trades, fetchTrades } = useTradeStore();

  const [datePreset, setDatePreset] = useState('all');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [artisanData, setArtisanData] = useState<ArtisanContribution[]>([]);

  useEffect(() => {
    fetchContributions();
    fetchExpenses();
    fetchArtisans();
    fetchTrades();
  }, []);

  useEffect(() => {
    // Apply date range filter inline
    const { startDate, endDate } = getDateRangeFromPreset(datePreset);
    const contribData = contributions.filter((c) => {
      if (!startDate && !endDate) return true;
      const d = new Date(c.created_at).toISOString().split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
    const expenseData = expenses.filter((e) => {
      if (!startDate && !endDate) return true;
      const d = new Date(e.created_at).toISOString().split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });

    // Calculate monthly data
    const months = [
      t('reports.jan'), t('reports.feb'), t('reports.mar'), t('reports.apr'),
      t('reports.may'), t('reports.jun'), t('reports.jul'), t('reports.aug'),
      t('reports.sep'), t('reports.oct'), t('reports.nov'), t('reports.dec')
    ];

    // Get year from date preset or use current year
    const yearToShow = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
    
    const data: MonthlyData[] = months.map((month, index) => {
      const monthContributions = contribData
        .filter(c => {
          const date = new Date(c.payment_date);
          return date.getMonth() === index && date.getFullYear() === yearToShow;
        })
        .reduce((sum, c) => sum + c.amount, 0);

      const monthExpenses = expenseData
        .filter(e => {
          const date = new Date(e.expense_date);
          return date.getMonth() === index && date.getFullYear() === yearToShow;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month,
        contributions: monthContributions,
        expenses: monthExpenses,
        balance: monthContributions - monthExpenses,
      };
    });

    setMonthlyData(data);

    // Calculate artisan contributions
    const artisanTotals = artisans.map(artisan => {
      const total = contribData
        .filter(c => c.artisan_id === artisan.id)
        .reduce((sum, c) => sum + c.amount, 0);
      return {
        name: artisan.full_name,
        total,
      };
    }).filter(a => a.total > 0).sort((a, b) => b.total - a.total).slice(0, 10);

    setArtisanData(artisanTotals);
  }, [contributions, expenses, artisans, datePreset, t]);

  // Apply date range filter to contributions and expenses for summary cards
  const { startDate: filterStart, endDate: filterEnd } = getDateRangeFromPreset(datePreset);
  const filteredContributions = contributions.filter((c) => {
    if (!filterStart && !filterEnd) return true;
    const d = new Date(c.created_at).toISOString().split('T')[0];
    if (filterStart && d < filterStart) return false;
    if (filterEnd && d > filterEnd) return false;
    return true;
  });
  const filteredExpenses = expenses.filter((e) => {
    if (!filterStart && !filterEnd) return true;
    const d = new Date(e.created_at).toISOString().split('T')[0];
    if (filterStart && d < filterStart) return false;
    if (filterEnd && d > filterEnd) return false;
    return true;
  });

  const totalFilteredContributions = filteredContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalFilteredExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalFilteredContributions - totalFilteredExpenses;

  const COLORS = ['#aa3bff', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

  const exportToCSV = () => {
    const csvContent = [
      [t('reports.month'), t('reports.contributions'), t('reports.expenses'), t('reports.balance')],
      ...monthlyData.map(d => [d.month, d.contributions, d.expenses, d.balance]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report-${datePreset}.csv`;
    link.click();
  };

  // Calculate extra stats
  const totalWorkers = artisans.reduce((sum, a) => sum + (a.employee_count || 0), 0);
  const activeArtisans = artisans.filter(a => a.is_active).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-h)] hidden md:block">
          {t('reports.title')}
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <DatePresetFilter
              value={datePreset}
              onChange={setDatePreset}
            />
          </div>
          <Button onClick={exportToCSV} variant="secondary" className="hidden md:inline-flex">
            <Download className="w-4 h-4" />
            {t('reports.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Mobile Summary Cards */}
      <div className="md:hidden space-y-3">
        {/* Card 1: عدد الحرفيين + عدد العمال */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('dashboard.totalArtisans')}</p>
                  <p className="text-lg font-bold text-[var(--text-h)]">{artisans.length}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <UserCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('reports.totalWorkers')}</p>
                  <p className="text-lg font-bold text-[var(--text-h)]">{totalWorkers}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: عدد الحرف + الحرفيون النشطون */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('reports.totalTrades')}</p>
                  <p className="text-lg font-bold text-[var(--text-h)]">{trades.length}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('dashboard.activeArtisans')}</p>
                  <p className="text-lg font-bold text-[var(--text-h)]">{activeArtisans}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: عدد المساهمات + إجمالي المساهمات */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <Wallet className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('reports.contributionCount')}</p>
                  <p className="text-lg font-bold text-[var(--text-h)]">{filteredContributions.length}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('dashboard.totalContributions')}</p>
                  <p className="text-lg font-bold text-[var(--accent)]">{formatCurrency(totalFilteredContributions)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: عدد المصاريف + إجمالي المصاريف */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Receipt className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('reports.expenseCount')}</p>
                  <p className="text-lg font-bold text-[var(--text-h)]">{filteredExpenses.length}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('dashboard.totalExpenses')}</p>
                  <p className="text-lg font-bold text-red-500">{formatCurrency(totalFilteredExpenses)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: الرصيد الصافي */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${netBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <Calendar className={`w-5 h-5 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('reports.netBalance')}</p>
                  <p className={`text-lg font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(netBalance)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: مجموع عدد أصحاب الحرف والعمال */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text)]">{t('reports.totalArtisansAndWorkers')}</p>
                  <p className="text-lg font-bold text-indigo-500">{artisans.length + totalWorkers}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('dashboard.totalContributions')}</p>
                <p className="text-2xl font-bold text-[var(--accent)]">
                  {formatCurrency(totalFilteredContributions)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent-bg)]">
                <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('dashboard.totalExpenses')}</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(totalFilteredExpenses)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <BarChart3 className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('reports.netBalance')}</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${netBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Calendar className={`w-6 h-6 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - مخفي على الهاتف */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.monthlySummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="contributions" 
                    name={t('reports.contributions')} 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    name={t('reports.expenses')} 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Artisan Contributions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.topArtisans')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={artisanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {artisanData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Balance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.balanceTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--text)" />
                  <YAxis stroke="var(--text)" tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="balance" name={t('reports.balance')} stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

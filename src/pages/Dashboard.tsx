import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  Package,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useArtisanStore } from '../stores/artisanStore';
import { useContributionStore } from '../stores/contributionStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useTradeStore } from '../stores/tradeStore';
import { formatCurrency } from '../lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { DashboardStats } from '../types';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, change, isPositive, icon, iconBg }: StatCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  workers: number;
  time: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

function ActivityItem({ icon, iconBg, title, description, workers, time, badge, badgeColor, onClick }: ActivityItemProps) {
  return (
    <div 
      className="flex items-start gap-4 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={onClick}
    >
      <div className={`p-2 rounded-full ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">{workers} {workers === 1 ? 'عامل' : 'عمال'}</p>
            <p className="text-xs text-muted-foreground mt-1">{time}</p>
          </div>
          {badge && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const { artisans, fetchArtisans } = useArtisanStore();
  const { contributions, fetchContributions } = useContributionStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { trades, fetchTrades } = useTradeStore();

  const [stats, setStats] = useState<DashboardStats>({
    total_artisans: 0,
    active_artisans: 0,
    total_contributions: 0,
    monthly_revenue: 0,
    total_expenses: 0,
  });

  // State for trade artisans modal
  const [selectedTrade, setSelectedTrade] = useState<{ trade: typeof trades[0]; artisans: typeof artisans } | null>(null);

  // Monthly revenue data for area chart
  const [revenueData, setRevenueData] = useState([
    { month: 'Jan', value: 4000 },
    { month: 'Feb', value: 3000 },
    { month: 'Mar', value: 5000 },
    { month: 'Apr', value: 4500 },
    { month: 'May', value: 6000 },
    { month: 'Jun', value: 5500 },
    { month: 'Jul', value: 7000 },
    { month: 'Aug', value: 8000 },
    { month: 'Sep', value: 7500 },
    { month: 'Oct', value: 9000 },
    { month: 'Nov', value: 8500 },
    { month: 'Dec', value: 9500 },
  ]);

  // Weekly orders data for bar chart
  const [weeklyData] = useState([
    { day: 'Mon', orders: 45 },
    { day: 'Tue', orders: 52 },
    { day: 'Wed', orders: 38 },
    { day: 'Thu', orders: 65 },
    { day: 'Fri', orders: 78 },
    { day: 'Sat', orders: 92 },
    { day: 'Sun', orders: 58 },
  ]);

  useEffect(() => {
    fetchArtisans();
    fetchContributions();
    fetchExpenses();
    fetchTrades();
  }, []);

  useEffect(() => {
    const activeArtisans = artisans.filter(a => a.is_active).length;
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = contributions
      .filter(c => {
        const date = new Date(c.payment_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, c) => sum + c.amount, 0);

    setStats({
      total_artisans: artisans.length,
      active_artisans: activeArtisans,
      total_contributions: totalContributions,
      monthly_revenue: monthlyRevenue,
      total_expenses: totalExpenses,
    });

    // Update revenue data with actual data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthRevenue = contributions
        .filter(c => {
          const date = new Date(c.payment_date);
          return date.getMonth() === i && date.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + c.amount, 0);
      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        value: monthRevenue || Math.floor(Math.random() * 5000) + 3000,
      };
    });
    setRevenueData(monthlyData);
  }, [artisans, contributions, expenses]);

  const statCards = [
    {
      title: t('dashboard.totalRevenue'),
      value: formatCurrency(stats.total_contributions),
      change: '+12.5% from last month',
      isPositive: true,
      icon: <Wallet className="w-6 h-6 text-white" />,
      iconBg: 'bg-blue-500',
    },
    {
      title: t('dashboard.totalArtisans'),
      value: stats.total_artisans.toLocaleString(),
      change: '+8.2% from last month',
      isPositive: true,
      icon: <Users className="w-6 h-6 text-white" />,
      iconBg: 'bg-purple-500',
    },
    {
      title: t('dashboard.totalContributions'),
      value: contributions.length.toLocaleString(),
      change: '+15.3% from last month',
      isPositive: true,
      icon: <Package className="w-6 h-6 text-white" />,
      iconBg: 'bg-green-500',
    },
    {
      title: t('dashboard.activeArtisans'),
      value: stats.active_artisans.toLocaleString(),
      change: '-2.1% from last month',
      isPositive: false,
      icon: <Package className="w-6 h-6 text-white" />,
      iconBg: 'bg-orange-500',
    },
  ];

  // Calculate trade statistics - count artisans and workers per trade
  const tradeStats = useMemo(() => {
    const stats = trades.map((trade) => {
      const tradeArtisans = artisans.filter((artisan) => artisan.trade_id === trade.id);
      const count = tradeArtisans.length;
      const workers = tradeArtisans.reduce((sum, artisan) => sum + (artisan.employee_count || 0), 0);
      return {
        trade,
        count,
        workers,
      };
    }).filter((stat) => stat.count > 0) // Only show trades with artisans
      .sort((a, b) => b.count - a.count); // Sort by count descending
    
    return stats;
  }, [trades, artisans]);

  // Generate colors for trade items
  const tradeColors = [
    { bg: 'bg-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { bg: 'bg-slate-600', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
    { bg: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { bg: 'bg-orange-600', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    { bg: 'bg-yellow-600', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { bg: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { bg: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { bg: 'bg-pink-600', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    { bg: 'bg-cyan-600', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    { bg: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview - Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.revenueOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Orders - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weeklyContributions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="day" 
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
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Trade Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {tradeStats.length > 0 ? (
              tradeStats.map((stat, index) => {
                const colors = tradeColors[index % tradeColors.length];
                return (
                  <ActivityItem
                    key={stat.trade.id}
                    icon={<Briefcase className="w-4 h-4 text-white" />}
                    iconBg={colors.bg}
                    title={stat.trade.name_ar}
                    description={`${stat.count} ${stat.count === 1 ? t('artisan.title') : t('dashboard.totalArtisans')}`}
                    workers={stat.workers}
                    time=""
                    badge={stat.trade.name_fr}
                    badgeColor={colors.badge}
                    onClick={() => setSelectedTrade({ 
                      trade: stat.trade, 
                      artisans: artisans.filter(a => a.trade_id === stat.trade.id)
                    })}
                  />
                );
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trade Artisans Modal */}
      <Modal
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        title={selectedTrade?.trade.name_ar || ''}
      >
        {selectedTrade && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('dashboard.totalArtisans')}: {selectedTrade.artisans.length}</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {selectedTrade.trade.name_fr}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-start text-sm font-medium text-muted-foreground">{t('artisan.fullName')}</th>
                    <th className="px-3 py-2 text-start text-sm font-medium text-muted-foreground">{t('artisan.shopNumber')}</th>
                    <th className="px-3 py-2 text-start text-sm font-medium text-muted-foreground">{t('artisan.area')}</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-muted-foreground">{t('artisan.employeeCount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedTrade.artisans.map((artisan) => (
                    <tr key={artisan.id} className="hover:bg-muted/50">
                      <td className="px-3 py-2 text-foreground">{artisan.full_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{artisan.shop_number}</td>
                      <td className="px-3 py-2 text-muted-foreground">{artisan.area}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{artisan.employee_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

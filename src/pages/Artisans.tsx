import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Eye, Phone, Users, MapPin, Briefcase, Store, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { DatePresetFilter, getDateRangeFromPreset } from '../components/ui/DatePresetFilter';
import { useArtisanStore } from '../stores/artisanStore';
import { useTradeStore } from '../stores/tradeStore';
import type { Artisan, ArtisanFormData, TradeFormData } from '../types';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, icon, iconBg }: StatCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'danger' | 'warning';
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }: ConfirmModalProps) {
  const isDanger = type === 'danger';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-0">
        {/* Header with red background */}
        <div className={`${isDanger ? 'bg-red-500' : 'bg-amber-500'} -mx-6 -mt-6 px-6 py-4 mb-6`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-foreground text-base">{message}</p>
        
        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <Button
            variant={isDanger ? 'destructive' : 'default'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function Artisans() {
  const { t } = useTranslation();
  const { artisans, fetchArtisans, createArtisan, updateArtisan, deleteArtisan, toggleArtisanStatus } = useArtisanStore();
  const { trades, fetchTrades, createTrade } = useTradeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeFormData, setTradeFormData] = useState<TradeFormData>({ name_ar: '', name_fr: '' });
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
  const [formData, setFormData] = useState<ArtisanFormData>({
    full_name: '',
    national_id: '',
    phone: '',
    shop_number: '',
    area: '',
    employee_count: 1,
    trade_id: '',
    is_active: true,
  });

  // Confirmation modals state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; artisan: Artisan | null }>({
    isOpen: false,
    artisan: null,
  });
  const [deactivateConfirm, setDeactivateConfirm] = useState<{ isOpen: boolean; artisan: Artisan | null }>({
    isOpen: false,
    artisan: null,
  });

  // View modal state
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; artisan: Artisan | null }>({
    isOpen: false,
    artisan: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Date preset filter state
  const [datePreset, setDatePreset] = useState('all');

  useEffect(() => {
    fetchArtisans();
    fetchTrades();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, datePreset]);

  const filteredArtisans = artisans.filter(
    (artisan) =>
      artisan.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.national_id.includes(searchTerm) ||
      artisan.shop_number.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((artisan) => {
    const { startDate, endDate } = getDateRangeFromPreset(datePreset);
    if (!startDate && !endDate) return true;
    const createdDate = new Date(artisan.created_at).toISOString().split('T')[0];
    if (startDate && createdDate < startDate) return false;
    if (endDate && createdDate > endDate) return false;
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredArtisans.length / pageSize);
  const paginatedArtisans = filteredArtisans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeArtisans = artisans.filter(a => a.is_active).length;
  const gZoneArtisans = artisans.filter(a => a.area === 'G').length;
  const pZoneArtisans = artisans.filter(a => a.area === 'P').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingArtisan) {
      await updateArtisan(editingArtisan.id, formData);
    } else {
      await createArtisan(formData);
    }
    
    closeModal();
  };

  const openModal = (artisan?: Artisan) => {
    if (artisan) {
      setEditingArtisan(artisan);
      setFormData({
        full_name: artisan.full_name,
        national_id: artisan.national_id,
        phone: artisan.phone || '',
        shop_number: artisan.shop_number,
        area: artisan.area,
        employee_count: artisan.employee_count,
        trade_id: artisan.trade_id,
        is_active: artisan.is_active,
      });
    } else {
      setEditingArtisan(null);
      setFormData({
        full_name: '',
        national_id: '',
        phone: '',
        shop_number: '',
        area: '',
        employee_count: 1,
        trade_id: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArtisan(null);
  };

  // Delete confirmation handlers
  const openDeleteConfirm = (artisan: Artisan) => {
    setDeleteConfirm({ isOpen: true, artisan });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, artisan: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.artisan) {
      await deleteArtisan(deleteConfirm.artisan.id);
      closeDeleteConfirm();
    }
  };

  // Deactivate confirmation handlers
  const openDeactivateConfirm = (artisan: Artisan) => {
    setDeactivateConfirm({ isOpen: true, artisan });
  };

  const closeDeactivateConfirm = () => {
    setDeactivateConfirm({ isOpen: false, artisan: null });
  };

  const handleDeactivateConfirm = async () => {
    if (deactivateConfirm.artisan) {
      await toggleArtisanStatus(deactivateConfirm.artisan.id, !deactivateConfirm.artisan.is_active);
      closeDeactivateConfirm();
    }
  };

  const handleStatusToggle = (artisan: Artisan) => {
    if (artisan.is_active) {
      // If currently active, show deactivate confirmation
      openDeactivateConfirm(artisan);
    } else {
      // If currently inactive, activate immediately without confirmation
      toggleArtisanStatus(artisan.id, true);
    }
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTrade(tradeFormData);
    setTradeFormData({ name_ar: '', name_fr: '' });
    setIsTradeModalOpen(false);
  };

  const statCards = [
    {
      title: t('artisan.totalArtisans'),
      value: artisans.length.toLocaleString(),
      icon: <Users className="w-6 h-6 text-white" />,
      iconBg: 'bg-blue-500',
    },
    {
      title: t('artisan.activeArtisans'),
      value: activeArtisans.toLocaleString(),
      icon: <Briefcase className="w-6 h-6 text-white" />,
      iconBg: 'bg-green-500',
    },
    {
      title: t('artisan.gZone'),
      value: gZoneArtisans.toLocaleString(),
      icon: <MapPin className="w-6 h-6 text-white" />,
      iconBg: 'bg-purple-500',
    },
    {
      title: t('artisan.pZone'),
      value: pZoneArtisans.toLocaleString(),
      icon: <Store className="w-6 h-6 text-white" />,
      iconBg: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground hidden md:block">
          {t('artisan.title')}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <DatePresetFilter
            value={datePreset}
            onChange={setDatePreset}
          />
          {/* Search - Small and next to add button */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('artisan.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm bg-transparent border border-border rounded-sm placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={() => openModal()} className="rounded-sm">
            <Plus className="w-4 h-4" />
            {t('artisan.addNew')}
          </Button>
          <Button onClick={() => setIsTradeModalOpen(true)} variant="secondary" className="rounded-sm">
            <Plus className="w-4 h-4" />
            {t('trade.addNew')}
          </Button>
        </div>
      </div>

      {/* Artisans Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('artisan.list')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.fullName')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.nationalId')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.shopNumber')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.trade')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.area')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedArtisans.map((artisan) => (
                  <tr key={artisan.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {artisan.full_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {artisan.national_id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {artisan.shop_number}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {artisan.trade?.name_ar}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {artisan.area}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(artisan)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          artisan.is_active
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        {artisan.is_active ? t('common.active') : t('common.inactive')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewModal({ isOpen: true, artisan })}
                          className="p-2 rounded-lg hover:bg-muted text-green-500"
                          title={t('common.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(artisan)}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(artisan)}
                          className="p-2 rounded-lg hover:bg-muted text-red-500"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredArtisans.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {t('common.noData')}
              </p>
            )}
          </div>
          {filteredArtisans.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              totalItems={filteredArtisans.length}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingArtisan ? t('artisan.editArtisan') : t('artisan.addNew')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={`${t('artisan.fullName')} *`}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label={t('artisan.nationalId')}
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
          />
          <Input
            label={t('artisan.phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData({ ...formData, phone: value });
            }}
            placeholder="06XXXXXXXX"
            maxLength={10}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`${t('artisan.shopNumber')} *`}
              value={formData.shop_number}
              onChange={(e) => setFormData({ ...formData, shop_number: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('artisan.area')} *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-2 rounded-sm border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
                required
              >
                <option value="">{t('common.select')}</option>
                <option value="G">G</option>
                <option value="P">P</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t('artisan.employeeCount')}
              value={formData.employee_count}
              onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
              min={0}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('artisan.trade')} *
              </label>
              <select
                value={formData.trade_id}
                onChange={(e) => setFormData({ ...formData, trade_id: e.target.value })}
                className="w-full px-4 py-2 rounded-sm border border-input bg-transparent text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
                required
              >
                <option value="">{t('contribution.selectArtisan')}</option>
                {trades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-foreground">
              {t('artisan.isActive')}
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {t('common.save')}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title={t('artisan.deleteTitle')}
        message={t('artisan.deleteMessage', { name: deleteConfirm.artisan?.full_name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={deactivateConfirm.isOpen}
        onClose={closeDeactivateConfirm}
        onConfirm={handleDeactivateConfirm}
        title={t('artisan.deactivateTitle')}
        message={t('artisan.deactivateMessage', { name: deactivateConfirm.artisan?.full_name })}
        confirmText={t('artisan.deactivate')}
        cancelText={t('common.cancel')}
        type="warning"
      />

      {/* View Artisan Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, artisan: null })}
        title={t('artisan.viewDetails')}
      >
        {viewModal.artisan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.fullName')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.nationalId')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.national_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.phone')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.phone || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.shopNumber')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.shop_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.area')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.area}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.employeeCount')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.employee_count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('artisan.trade')}</p>
                <p className="font-medium text-foreground">{viewModal.artisan.trade?.name_ar}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('common.status')}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  viewModal.artisan.is_active
                    ? 'bg-orange-500 text-white dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {viewModal.artisan.is_active ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-2">
              {viewModal.artisan.phone && (
                <>
                  <a
                    href={`tel:${viewModal.artisan.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    {t('call')}
                  </a>
                  <a
                    href={`https://wa.me/${viewModal.artisan.phone.replace(/^0/, '212')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t('whatsapp')}
                  </a>
                </>
              )}
              <Button
                onClick={() => setViewModal({ isOpen: false, artisan: null })}
                className={viewModal.artisan.phone ? 'flex-1' : 'w-full'}
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Trade Modal */}
      <Modal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        title={t('trade.addNew')}
      >
        <form onSubmit={handleTradeSubmit} className="space-y-4">
          <Input
            label={t('trade.nameAr')}
            value={tradeFormData.name_ar}
            onChange={(e) => setTradeFormData({ ...tradeFormData, name_ar: e.target.value })}
            required
          />
          <Input
            label={t('trade.nameFr')}
            value={tradeFormData.name_fr}
            onChange={(e) => setTradeFormData({ ...tradeFormData, name_fr: e.target.value })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {t('common.save')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsTradeModalOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

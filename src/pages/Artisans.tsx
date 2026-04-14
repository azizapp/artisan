import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Users, MapPin, Briefcase, Store, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useArtisanStore } from '../stores/artisanStore';
import { useTradeStore } from '../stores/tradeStore';
import type { Artisan, ArtisanFormData } from '../types';

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            variant={type === 'danger' ? 'destructive' : 'default'}
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
  const { trades, fetchTrades } = useTradeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
  const [formData, setFormData] = useState<ArtisanFormData>({
    full_name: '',
    national_id: '',
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

  useEffect(() => {
    fetchArtisans();
    fetchTrades();
  }, []);

  const filteredArtisans = artisans.filter(
    (artisan) =>
      artisan.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.national_id.includes(searchTerm)
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
        <h1 className="text-2xl font-bold text-foreground">
          {t('artisan.title')}
        </h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          {t('artisan.addNew')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('artisan.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
                {filteredArtisans.map((artisan) => (
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
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
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
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
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
    </div>
  );
}

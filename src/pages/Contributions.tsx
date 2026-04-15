import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Calendar, Wallet, Receipt, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useContributionStore } from '../stores/contributionStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useArtisanStore } from '../stores/artisanStore';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Contribution, ContributionFormData } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-0">
        {/* Header with red background */}
        <div className="bg-red-500 -mx-6 -mt-6 px-6 py-4 mb-6">
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
            variant="destructive"
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

export function Contributions() {
  const { t } = useTranslation();
  const { contributions, fetchContributions, createContribution, updateContribution, deleteContribution } = useContributionStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { artisans, fetchArtisans } = useArtisanStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; contribution: Contribution | null }>({
    isOpen: false,
    contribution: null,
  });
  const [formData, setFormData] = useState<ContributionFormData>({
    artisan_id: '',
    occasion: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchContributions();
    fetchExpenses();
    fetchArtisans();
  }, []);

  const filteredContributions = contributions.filter(
    (contribution) =>
      contribution.artisan?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.occasion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContribution) {
      await updateContribution(editingContribution.id, formData);
    } else {
      await createContribution(formData);
    }
    
    closeModal();
  };

  const openModal = (contribution?: Contribution) => {
    if (contribution) {
      setEditingContribution(contribution);
      setFormData({
        artisan_id: contribution.artisan_id,
        occasion: contribution.occasion,
        amount: contribution.amount,
        payment_date: contribution.payment_date,
        notes: contribution.notes || '',
      });
    } else {
      setEditingContribution(null);
      setFormData({
        artisan_id: '',
        occasion: '',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContribution(null);
  };

  const openDeleteConfirm = (contribution: Contribution) => {
    setDeleteConfirm({ isOpen: true, contribution });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, contribution: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.contribution) {
      await deleteContribution(deleteConfirm.contribution.id);
      closeDeleteConfirm();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('dashboard.totalContributions')}</p>
                <p className="text-2xl font-bold text-[var(--text-h)]">
                  {contributions.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent-bg)]">
                <Wallet className="w-6 h-6 text-[var(--accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('contribution.totalAmount')}</p>
                <p className="text-2xl font-bold text-[var(--accent)]">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Calendar className="w-6 h-6 text-green-500" />
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
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <Receipt className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {t('contribution.title')}
        </h1>
        <div className="flex items-center gap-3">
          {/* Search - Small and next to add button */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('contribution.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm bg-transparent border border-border rounded-sm placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            {t('contribution.addNew')}
          </Button>
        </div>
      </div>

      {/* Contributions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('contribution.artisan')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('contribution.occasion')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('contribution.amount')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('contribution.paymentDate')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('contribution.notes')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContributions.map((contribution) => (
                  <tr key={contribution.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {contribution.artisan?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contribution.artisan?.national_id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {contribution.occasion}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary">
                        {formatCurrency(contribution.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(contribution.payment_date)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {contribution.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(contribution)}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(contribution)}
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
            {filteredContributions.length === 0 && (
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
        title={editingContribution ? t('contribution.editContribution') : t('contribution.addNew')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
              {t('contribution.artisan')} *
            </label>
            <select
              value={formData.artisan_id}
              onChange={(e) => setFormData({ ...formData, artisan_id: e.target.value })}
              className="w-full px-4 py-2 rounded-sm border border-border bg-transparent text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
              required
            >
              <option value="">{t('contribution.selectArtisan')}</option>
              {artisans.filter(a => a.is_active).map((artisan) => (
                <option key={artisan.id} value={artisan.id}>
                  {artisan.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
              {t('contribution.occasion')} *
            </label>
            <input
              type="text"
              list="occasions-list"
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              required
              placeholder={t('contribution.occasionPlaceholder')}
              className="w-full px-4 py-2 rounded-sm border border-border bg-transparent text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none placeholder:text-muted-foreground"
            />
            <datalist id="occasions-list">
              {Array.from(new Set(contributions.map(c => c.occasion))).filter(Boolean).map((occasion, index) => (
                <option key={index} value={occasion} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t('contribution.amount')}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              min={0}
              step={0.01}
            />
            <Input
              type="date"
              label={t('contribution.paymentDate')}
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
              {t('contribution.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)] outline-none resize-none"
              rows={3}
              placeholder={t('contribution.notesPlaceholder')}
            />
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
        title={t('contribution.deleteTitle')}
        message={t('contribution.deleteMessage', { 
          artisan: deleteConfirm.contribution?.artisan?.full_name,
          amount: deleteConfirm.contribution ? formatCurrency(deleteConfirm.contribution.amount) : ''
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}

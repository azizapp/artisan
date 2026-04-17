import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Receipt, Calendar, Wallet, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { DatePresetFilter, getDateRangeFromPreset } from '../components/ui/DatePresetFilter';
import { useExpenseStore } from '../stores/expenseStore';
import { useContributionStore } from '../stores/contributionStore';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Expense, ExpenseFormData } from '../types';

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
        <div className="bg-red-500 -mx-6 -mt-6 px-6 py-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
        </div>
        <p className="text-foreground text-base">{message}</p>
        <div className="flex gap-3 pt-6">
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
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

export function Expenses() {
  const { t } = useTranslation();
  const { expenses, fetchExpenses, createExpense, updateExpense, deleteExpense } = useExpenseStore();
  const { contributions, fetchContributions } = useContributionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    subject: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; expense: Expense | null }>({
    isOpen: false,
    expense: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Date preset filter state
  const [datePreset, setDatePreset] = useState('all');

  useEffect(() => {
    fetchExpenses();
    fetchContributions();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, datePreset]);

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter((expense) => {
    const { startDate, endDate } = getDateRangeFromPreset(datePreset);
    if (!startDate && !endDate) return true;
    const createdDate = new Date(expense.created_at).toISOString().split('T')[0];
    if (startDate && createdDate < startDate) return false;
    if (endDate && createdDate > endDate) return false;
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      await updateExpense(editingExpense.id, formData);
    } else {
      await createExpense(formData);
    }
    
    closeModal();
  };

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        subject: expense.subject,
        amount: expense.amount,
        expense_date: expense.expense_date,
        notes: expense.notes || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        subject: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const openDeleteConfirm = (expense: Expense) => {
    setDeleteConfirm({ isOpen: true, expense });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, expense: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.expense) {
      await deleteExpense(deleteConfirm.expense.id);
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
                <p className="text-sm text-[var(--text)]">{t('dashboard.totalExpenses')}</p>
                <p className="text-2xl font-bold text-[var(--text-h)]">
                  {expenses.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <Receipt className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('expense.totalAmount')}</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">{t('dashboard.totalContributions')}</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(totalContributions)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground hidden md:block">
          {t('expense.title')}
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
              placeholder={t('expense.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm bg-transparent border border-border rounded-sm placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={() => openModal()} className="md:py-2 md:px-4 py-1.5 px-2.5 text-sm md:text-base">
            <Plus className="w-4 h-4 md:mr-1" />
            <span className="hidden md:inline">{t('expense.addNew')}</span>
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('expense.subject')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('expense.amount')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground hidden md:table-cell">
                    {t('expense.expenseDate')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground hidden md:table-cell">
                    {t('expense.notes')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {expense.subject}
                      </p>
                      <p className="text-sm text-muted-foreground md:hidden">
                        {formatDate(expense.expense_date)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-500">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(expense.expense_date)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate hidden md:table-cell">
                      {expense.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(expense)}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(expense)}
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
            {filteredExpenses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {t('common.noData')}
              </p>
            )}
          </div>
          {filteredExpenses.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              totalItems={filteredExpenses.length}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingExpense ? t('expense.editExpense') : t('expense.addNew')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
              {t('expense.subject')} *
            </label>
            <input
              type="text"
              list="subjects-list"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder={t('expense.subjectPlaceholder')}
              className="w-full px-4 py-2 rounded-sm border border-border bg-transparent text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none placeholder:text-muted-foreground"
            />
            <datalist id="subjects-list">
              {Array.from(new Set(expenses.map(e => e.subject))).filter(Boolean).map((subject, index) => (
                <option key={index} value={subject} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={`${t('expense.amount')} *`}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              min={0}
              step={0.01}
            />
            <Input
              type="date"
              label={`${t('expense.expenseDate')} *`}
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
              {t('expense.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-sm border border-border bg-transparent text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none resize-none placeholder:text-muted-foreground"
              rows={3}
              placeholder={t('expense.notesPlaceholder')}
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

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title={t('expense.deleteTitle')}
        message={t('expense.deleteMessage', {
          name: deleteConfirm.expense?.subject,
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}

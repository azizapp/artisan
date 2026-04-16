import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { useUserStore } from '../stores/userStore';
import { formatDate } from '../lib/utils';
import type { User } from '../types';

interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
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
        {/* Header with colored background */}
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

export function Users() {
  const { t } = useTranslation();
  const { users, fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    password: '',
    role: 'user',
    is_active: true,
  });

  // Confirmation modals state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [deactivateConfirm, setDeactivateConfirm] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const updateData: Partial<UserFormData> = {
        full_name: formData.full_name,
        role: formData.role,
        is_active: formData.is_active,
      };
      await updateUser(editingUser.id, updateData);
    } else {
      await createUser(formData);
    }

    closeModal();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        full_name: user.full_name,
        password: '',
        role: user.role as 'admin' | 'user',
        is_active: user.is_active ?? true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Delete handlers
  const openDeleteConfirm = (user: User) => {
    setDeleteConfirm({ isOpen: true, user });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, user: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.user) {
      await deleteUser(deleteConfirm.user.id);
      closeDeleteConfirm();
    }
  };

  // Deactivate handlers
  const openDeactivateConfirm = (user: User) => {
    setDeactivateConfirm({ isOpen: true, user });
  };

  const closeDeactivateConfirm = () => {
    setDeactivateConfirm({ isOpen: false, user: null });
  };

  const handleDeactivateConfirm = async () => {
    if (deactivateConfirm.user) {
      await toggleUserStatus(deactivateConfirm.user.id, false);
      closeDeactivateConfirm();
    }
  };

  const handleStatusToggle = (user: User) => {
    if (user.is_active ?? true) {
      openDeactivateConfirm(user);
    } else {
      toggleUserStatus(user.id, true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {t('settings.userManagement')}
        </h1>
        <div className="flex items-center gap-3">
          {/* Search - Small and next to add button */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('user.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm bg-transparent border border-border rounded-sm placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            {t('user.addNew')}
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('auth.email')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.fullName')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('user.role')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('artisan.createdAt')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.full_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {user.role === 'admin' ? t('user.admin') : t('user.user')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          (user.is_active ?? true)
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        {(user.is_active ?? true) ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            {t('common.active')}
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            {t('common.inactive')}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(user)}
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
            {filteredUsers.length === 0 && (
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
        title={editingUser ? t('user.editUser') : t('user.addNew')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('artisan.fullName')}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            type="email"
            label={t('auth.email')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              type="password"
              label={t('auth.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              minLength={6}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('user.role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              className="w-full px-4 py-2 rounded-sm border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
              required
            >
              <option value="user">{t('user.user')}</option>
              <option value="admin">{t('user.admin')}</option>
            </select>
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
              {t('user.isActive')}
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
        title={t('user.deleteTitle')}
        message={t('user.deleteMessage', { name: deleteConfirm.user?.full_name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={deactivateConfirm.isOpen}
        onClose={closeDeactivateConfirm}
        onConfirm={handleDeactivateConfirm}
        title={t('user.deactivateTitle')}
        message={t('user.deactivateMessage', { name: deactivateConfirm.user?.full_name })}
        confirmText={t('user.deactivate')}
        cancelText={t('common.cancel')}
        type="warning"
      />
    </div>
  );
}

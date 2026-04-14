import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = async (id: string) => {
    if (confirm(t('user.confirmDelete'))) {
      await deleteUser(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-h)]">
          {t('settings.userManagement')}
        </h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          {t('user.addNew')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text)]" />
        <Input
          type="text"
          placeholder={t('user.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-h)]">
                    {t('auth.email')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-h)]">
                    {t('artisan.fullName')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-h)]">
                    {t('user.role')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-h)]">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-h)]">
                    {t('artisan.createdAt')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-h)]">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--border)]/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-h)]">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
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
                        onClick={() => toggleUserStatus(user.id, !(user.is_active ?? true))}
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
                    <td className="px-4 py-3 text-[var(--text)]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 rounded-lg hover:bg-[var(--border)] text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-[var(--border)] text-red-500"
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
              <p className="text-center text-[var(--text)] py-8">
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
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">
              {t('user.role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)] outline-none"
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
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="is_active" className="text-sm text-[var(--text-h)]">
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
    </div>
  );
}

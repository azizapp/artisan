import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Type, Monitor, Briefcase, Plus, Edit2, Trash2, AlertTriangle, Users, Search, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useSettingsStore } from '../stores/settingsStore';
import { useTradeStore } from '../stores/tradeStore';
import { useUserStore } from '../stores/userStore';
import type { Trade, User, UserRole } from '../types';

// Beautiful Arabic and French fonts
const fontOptions = [
  { value: 'Inter, Arial, system-ui, sans-serif', label: 'Inter (Default)' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: '"Segoe UI", Roboto, sans-serif', label: 'Segoe UI' },
  { value: '"Noto Sans Arabic", "Noto Sans", sans-serif', label: 'Noto Sans Arabic' },
  { value: '"Tajawal", "Noto Sans Arabic", sans-serif', label: 'Tajawal (Arabic)' },
  { value: '"Cairo", "Noto Sans Arabic", sans-serif', label: 'Cairo (Arabic)' },
  { value: '"Almarai", "Noto Sans Arabic", sans-serif', label: 'Almarai (Arabic)' },
  { value: '"Lato", "Open Sans", sans-serif', label: 'Lato (French)' },
  { value: '"Montserrat", "Lato", sans-serif', label: 'Montserrat (French)' },
  { value: '"Poppins", "Open Sans", sans-serif', label: 'Poppins (French)' },
  { value: '"Open Sans", sans-serif', label: 'Open Sans' },
];

const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

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

interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'writer' | 'treasurer' | 'secretary' | 'consultant';
  is_active: boolean;
}

export function Settings() {
  const { t } = useTranslation();
  const {
    theme,
    language,
    fontFamily,
    fontSize,
    setFontFamily,
    setFontSize,
    toggleTheme,
    toggleLanguage,
  } = useSettingsStore();

  // Trades management state
  const { trades, fetchTrades, createTrade, updateTrade, deleteTrade } = useTradeStore();
  const [isTradesSectionOpen, setIsTradesSectionOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [tradeFormData, setTradeFormData] = useState({ name_ar: '', name_fr: '' });
  const [tradeDeleteConfirm, setTradeDeleteConfirm] = useState<{ isOpen: boolean; trade: Trade | null }>({
    isOpen: false,
    trade: null,
  });

  // Users management state
  const { users, fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } = useUserStore();
  const [isUsersSectionOpen, setIsUsersSectionOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    password: '',
    role: 'writer',
    is_active: true,
  });
  const [userDeleteConfirm, setUserDeleteConfirm] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [userDeactivateConfirm, setUserDeactivateConfirm] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  useEffect(() => {
    fetchTrades();
    fetchUsers();
  }, []);

  // Trade handlers
  const openTradeModal = (trade?: Trade) => {
    if (trade) {
      setEditingTrade(trade);
      setTradeFormData({ name_ar: trade.name_ar, name_fr: trade.name_fr });
    } else {
      setEditingTrade(null);
      setTradeFormData({ name_ar: '', name_fr: '' });
    }
    setIsTradeModalOpen(true);
  };

  const closeTradeModal = () => {
    setIsTradeModalOpen(false);
    setEditingTrade(null);
    setTradeFormData({ name_ar: '', name_fr: '' });
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrade) {
      await updateTrade(editingTrade.id, tradeFormData);
    } else {
      await createTrade(tradeFormData);
    }
    closeTradeModal();
  };

  const openTradeDeleteConfirm = (trade: Trade) => {
    setTradeDeleteConfirm({ isOpen: true, trade });
  };

  const closeTradeDeleteConfirm = () => {
    setTradeDeleteConfirm({ isOpen: false, trade: null });
  };

  const handleTradeDeleteConfirm = async () => {
    if (tradeDeleteConfirm.trade) {
      await deleteTrade(tradeDeleteConfirm.trade.id);
      closeTradeDeleteConfirm();
    }
  };

  // User handlers
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        email: user.email,
        full_name: user.full_name,
        password: '',
        role: user.role,
        is_active: user.is_active ?? true,
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        email: '',
        full_name: '',
        password: '',
        role: 'writer',
        is_active: true,
      });
    }
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updateData: Partial<UserFormData> = {
        full_name: userFormData.full_name,
        role: userFormData.role,
        is_active: userFormData.is_active,
      };
      await updateUser(editingUser.id, updateData);
    } else {
      await createUser(userFormData);
    }
    closeUserModal();
  };

  const openUserDeleteConfirm = (user: User) => {
    setUserDeleteConfirm({ isOpen: true, user });
  };

  const closeUserDeleteConfirm = () => {
    setUserDeleteConfirm({ isOpen: false, user: null });
  };

  const handleUserDeleteConfirm = async () => {
    if (userDeleteConfirm.user) {
      await deleteUser(userDeleteConfirm.user.id);
      closeUserDeleteConfirm();
    }
  };

  const openUserDeactivateConfirm = (user: User) => {
    setUserDeactivateConfirm({ isOpen: true, user });
  };

  const closeUserDeactivateConfirm = () => {
    setUserDeactivateConfirm({ isOpen: false, user: null });
  };

  const handleUserDeactivateConfirm = async () => {
    if (userDeactivateConfirm.user) {
      await toggleUserStatus(userDeactivateConfirm.user.id, false);
      closeUserDeactivateConfirm();
    }
  };

  const handleUserStatusToggle = (user: User) => {
    if (user.is_active ?? true) {
      openUserDeactivateConfirm(user);
    } else {
      toggleUserStatus(user.id, true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>

      {/* Typography & Language Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('settings.typography')}</h2>
          </div>

          <div className="space-y-4">
            {/* Font Family Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('settings.fontFamily')}
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-2 rounded-sm border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Selection - Below Font Family */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('settings.fontSize')}
              </label>
              <div className="flex gap-2">
                {fontSizeOptions.map((size) => (
                  <Button
                    key={size.value}
                    variant={fontSize === size.value ? 'default' : 'outline'}
                    onClick={() => setFontSize(size.value as 'small' | 'medium' | 'large')}
                    className="flex-1"
                  >
                    {t(`settings.${size.value}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="pt-2 border-t border-border">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('settings.language')}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={language === 'ar' ? 'default' : 'outline'}
                  onClick={() => language !== 'ar' && toggleLanguage()}
                  className="flex-1"
                >
                  {t('settings.arabic')}
                </Button>
                <Button
                  variant={language === 'fr' ? 'default' : 'outline'}
                  onClick={() => language !== 'fr' && toggleLanguage()}
                  className="flex-1"
                >
                  {t('settings.french')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management & Interface Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interface Theme */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('settings.interfaceTheme')}</h2>
            </div>

            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => theme !== 'light' && toggleTheme()}
                className="flex-1 flex items-center gap-2"
              >
                <Sun className="w-4 h-4" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => theme !== 'dark' && toggleTheme()}
                className="flex-1 flex items-center gap-2"
              >
                <Moon className="w-4 h-4" />
                {t('settings.dark')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Management Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* Trades Management Button */}
          <div className="cursor-pointer" onClick={() => setIsTradesSectionOpen(true)}>
            <Card className="hover:bg-muted/30 transition-colors h-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-xl bg-amber-500">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t('settings.tradesManagement')}</p>
                    <p className="text-xs text-muted-foreground">{trades.length} {t('trade.title')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Button */}
          <div className="cursor-pointer" onClick={() => setIsUsersSectionOpen(true)}>
            <Card className="hover:bg-muted/30 transition-colors h-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-xl bg-blue-500">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t('settings.userManagement')}</p>
                    <p className="text-xs text-muted-foreground">{users.length} {t('user.title')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      <Modal
        isOpen={isTradeModalOpen}
        onClose={closeTradeModal}
        title={editingTrade ? t('trade.editTrade') : t('trade.addNew')}
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
            <Button type="button" variant="secondary" onClick={closeTradeModal}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Trade Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={tradeDeleteConfirm.isOpen}
        onClose={closeTradeDeleteConfirm}
        onConfirm={handleTradeDeleteConfirm}
        title={t('trade.deleteTitle')}
        message={t('trade.deleteMessage', { name: tradeDeleteConfirm.trade?.name_ar })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* Trades Section Modal */}
      <Modal
        isOpen={isTradesSectionOpen}
        onClose={() => setIsTradesSectionOpen(false)}
        title={t('settings.tradesManagement')}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setIsTradesSectionOpen(false); openTradeModal(); }}>
              <Plus className="w-4 h-4" />
              {t('trade.addNew')}
            </Button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('trade.nameAr')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('trade.nameFr')}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-foreground">{trade.name_ar}</td>
                    <td className="px-4 py-3 text-muted-foreground">{trade.name_fr}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setIsTradesSectionOpen(false); openTradeModal(trade); }}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openTradeDeleteConfirm(trade)}
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
            {trades.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Users Section Modal */}
      <Modal
        isOpen={isUsersSectionOpen}
        onClose={() => setIsUsersSectionOpen(false)}
        title={t('settings.userManagement')}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('user.searchPlaceholder')}
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-transparent border border-border rounded-sm placeholder:text-muted-foreground"
              />
            </div>
            <Button onClick={() => { setIsUsersSectionOpen(false); openUserModal(); }}>
              <Plus className="w-4 h-4" />
              {t('user.addNew')}
            </Button>
          </div>
          <div className="overflow-x-auto max-h-96">
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
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
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
                        {t(`user.${user.role}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUserStatusToggle(user)}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setIsUsersSectionOpen(false); openUserModal(user); }}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openUserDeleteConfirm(user)}
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
              <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* User Add/Edit Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        title={editingUser ? t('user.editUser') : t('user.addNew')}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <Input
            label={t('artisan.fullName')}
            value={userFormData.full_name}
            onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
            required
          />
          <Input
            type="email"
            label={t('auth.email')}
            value={userFormData.email}
            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
            required
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              type="password"
              label={t('auth.password')}
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              required={!editingUser}
              minLength={6}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('user.role')}
            </label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 rounded-sm border border-input bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
              required
            >
              <option value="writer">{t('user.writer')}</option>
              <option value="treasurer">{t('user.treasurer')}</option>
              <option value="secretary">{t('user.secretary')}</option>
              <option value="consultant">{t('user.consultant')}</option>
              <option value="admin">{t('user.admin')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={userFormData.is_active}
              onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })}
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
            <Button type="button" variant="secondary" onClick={closeUserModal}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={userDeleteConfirm.isOpen}
        onClose={closeUserDeleteConfirm}
        onConfirm={handleUserDeleteConfirm}
        title={t('user.deleteTitle')}
        message={t('user.deleteMessage', { name: userDeleteConfirm.user?.full_name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* User Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={userDeactivateConfirm.isOpen}
        onClose={closeUserDeactivateConfirm}
        onConfirm={handleUserDeactivateConfirm}
        title={t('user.deactivateTitle')}
        message={t('user.deactivateMessage', { name: userDeactivateConfirm.user?.full_name })}
        confirmText={t('user.deactivate')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}

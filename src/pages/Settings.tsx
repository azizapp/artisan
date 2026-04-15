import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Type, Monitor, Briefcase, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useSettingsStore } from '../stores/settingsStore';
import { useTradeStore } from '../stores/tradeStore';
import type { Trade } from '../types';

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
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [tradeFormData, setTradeFormData] = useState({ name_ar: '', name_fr: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; trade: Trade | null }>({
    isOpen: false,
    trade: null,
  });

  useEffect(() => {
    fetchTrades();
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

  const openDeleteConfirm = (trade: Trade) => {
    setDeleteConfirm({ isOpen: true, trade });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, trade: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.trade) {
      await deleteTrade(deleteConfirm.trade.id);
      closeDeleteConfirm();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>

      {/* Appearance Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('settings.appearance')}</h2>
          </div>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('settings.theme')}</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'light' ? t('settings.light') : t('settings.dark')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="flex items-center gap-2"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    {t('settings.dark')}
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    {t('settings.light')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('settings.fontFamily')}</h2>
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
                className="w-full px-4 py-2 rounded-sm border border-input bg-transparent text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Selection */}
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
          </div>
        </CardContent>
      </Card>

      {/* Language Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('settings.language')}</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{t('settings.language')}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? t('settings.arabic') : t('settings.french')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? t('settings.french') : t('settings.arabic')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trades Management Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t('settings.tradesManagement')}</h2>
            </div>
            <Button onClick={() => openTradeModal()}>
              <Plus className="w-4 h-4" />
              {t('trade.addNew')}
            </Button>
          </div>

          <div className="overflow-x-auto">
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
                          onClick={() => openTradeModal(trade)}
                          className="p-2 rounded-lg hover:bg-muted text-blue-500"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(trade)}
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
        </CardContent>
      </Card>

      {/* User Management Link */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{t('settings.userManagement')}</p>
              <p className="text-sm text-muted-foreground">{t('user.title')}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/users'}>
              {t('common.manage')}
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title={t('trade.deleteTitle')}
        message={t('trade.deleteMessage', { name: deleteConfirm.trade?.name_ar })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}

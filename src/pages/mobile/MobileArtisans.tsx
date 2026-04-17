import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Phone, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useArtisanStore } from '../../stores/artisanStore';
import { useTradeStore } from '../../stores/tradeStore';
import type { Artisan, ArtisanFormData } from '../../types';

export function MobileArtisans() {
  const { t } = useTranslation();
  const { artisans, fetchArtisans, createArtisan } = useArtisanStore();
  const { trades, fetchTrades } = useTradeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; artisan: Artisan | null }>({
    isOpen: false,
    artisan: null,
  });
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

  useEffect(() => {
    fetchArtisans();
    fetchTrades();
  }, []);

  const filteredArtisans = artisans.filter(
    (artisan) =>
      artisan.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.shop_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createArtisan(formData);
    setIsModalOpen(false);
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
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('artisan.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Add Button */}
      <Button onClick={() => setIsModalOpen(true)} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        {t('artisan.addNew')}
      </Button>

      {/* Artisans List */}
      <div className="space-y-3">
        {filteredArtisans.map((artisan) => (
          <div
            key={artisan.id}
            className="bg-card rounded-lg p-4 border border-border space-y-2"
          >
            {/* Line 1: Name + Trade (left) | Shop# + Area + Status (right) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold text-foreground truncate max-w-[160px]">{artisan.full_name}</h3>
                <span className="text-xs text-orange-500 shrink-0">{artisan.trade?.name_ar}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-muted-foreground">{artisan.shop_number} - {artisan.area}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  artisan.is_active
                    ? 'bg-orange-500 text-white dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {artisan.is_active ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>

            {/* Line 2: WhatsApp + Call + View Details buttons */}
            <div className="flex items-center gap-1.5">
              {artisan.phone && (
                <>
                  <a
                    href={`https://wa.me/${artisan.phone.replace(/^0/, '212')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[70px] h-[30px] flex items-center justify-center rounded-md bg-muted text-green-600"
                    title={t('whatsapp')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                  <a
                    href={`tel:${artisan.phone}`}
                    className="w-[70px] h-[30px] flex items-center justify-center rounded-md bg-muted text-blue-600"
                    title={t('call')}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </>
              )}
              <button
                onClick={() => setViewModal({ isOpen: true, artisan })}
                className="w-[70px] h-[30px] flex items-center justify-center rounded-md bg-muted text-foreground"
                title={t('artisan.viewDetails')}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredArtisans.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {t('common.noData')}
        </p>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('artisan.addNew')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('artisan.fullName')}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label={t('artisan.phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="06XXXXXXXX"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('artisan.shopNumber')}
              value={formData.shop_number}
              onChange={(e) => setFormData({ ...formData, shop_number: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1">{t('artisan.area')}</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                required
              >
                <option value="">{t('common.select')}</option>
                <option value="G">G</option>
                <option value="P">P</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('artisan.trade')}</label>
            <select
              value={formData.trade_id}
              onChange={(e) => setFormData({ ...formData, trade_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              required
            >
              <option value="">{t('common.select')}</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.name_ar}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {t('common.save')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
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
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    {t('call')}
                  </a>
                  <a
                    href={`https://wa.me/${viewModal.artisan.phone.replace(/^0/, '212')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex-1"
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
    </div>
  );
}

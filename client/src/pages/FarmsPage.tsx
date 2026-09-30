import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { FarmCard, Farm } from '../components/FarmCard.js';
import { FarmModal } from '../components/FarmModal.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { EmptyState } from '../components/EmptyState.js';
import { Sprout, Plus } from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      setFarms(res.data.farms || []);
    } catch (err: any) {
      error('Error', err.response?.data?.error || 'Could not load farm profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAdd = () => {
    setSelectedFarm(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setSelectedFarm(farm);
    setModalOpen(true);
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!window.confirm(t('deleteFarmConfirm'))) return;

    try {
      await api.delete(`/farms/${farmId}`);
      success('Farm Deleted', 'Farm profile has been removed.');
      setFarms((prev) => prev.filter((f) => f.id !== farmId));
    } catch (err: any) {
      error('Delete Error', err.response?.data?.error || 'Could not delete farm profile');
    }
  };

  const handleSubmitFarm = async (values: any) => {
    setSubmitting(true);
    try {
      if (selectedFarm) {
        // Update
        const res = await api.put(`/farms/${selectedFarm.id}`, values);
        success('Farm Updated', 'Farm profile has been successfully modified.');
        setFarms((prev) => prev.map((f) => (f.id === selectedFarm.id ? res.data.farm : f)));
      } else {
        // Create
        const res = await api.post('/farms', values);
        success('Farm Created', 'New farm profile added to your account.');
        setFarms((prev) => [res.data.farm, ...prev]);
      }
      setModalOpen(false);
      setSelectedFarm(null);
    } catch (err: any) {
      error('Save Error', err.response?.data?.error || 'Failed to save farm profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-8 h-8 text-emerald-600" />
            {t('farmsTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('farmsSubtitle')}</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition self-start sm:self-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('addFarmBtn')}
        </button>
      </div>

      {/* Farms List / Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" rows={3} />
      ) : farms.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No farm profiles yet"
          description="Register your agricultural land to receive personalized soil nutrient management, irrigation plans, and crop disease advisories."
          actionText={t('addFarmBtn')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteFarm}
            />
          ))}
        </div>
      )}

      {/* Farm Create/Edit Modal */}
      <FarmModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedFarm(null);
        }}
        onSubmit={handleSubmitFarm}
        initialData={selectedFarm}
        loading={submitting}
      />
    </div>
  );
};

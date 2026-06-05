import { useState, useEffect } from 'react';
import type { Specialty, SpecialtyFormData } from '../../types';
import { adminApi } from '../../services/api';
import { SpecialtyModal } from '../../components/admin/SpecialtyModal';
import { SpecialtyIcon } from '../../components/ui/SpecialtyIcon';

export function AdminSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

  const loadSpecialties = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSpecialties();
      setSpecialties(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar especialidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const handleSave = async (data: SpecialtyFormData) => {
    if (editingSpecialty) {
      await adminApi.updateSpecialty(editingSpecialty.id, data);
    } else {
      await adminApi.createSpecialty(data);
    }
    await loadSpecialties();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de que queres eliminar esta especialidad?')) return;

    try {
      await adminApi.deleteSpecialty(id);
      await loadSpecialties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const openEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingSpecialty(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSpecialty(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando especialidades...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Especialidades</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          Nueva especialidad
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialties.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay especialidades registradas
          </div>
        ) : (
          specialties.map((specialty) => (
            <div
              key={specialty.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <SpecialtyIcon name={specialty.icon} className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{specialty.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{specialty.description}</p>
                  {specialty.doctors && specialty.doctors.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {specialty.doctors.length} medico{specialty.doctors.length !== 1 ? 's' : ''} asignado{specialty.doctors.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEdit(specialty)}
                  className="flex-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(specialty.id)}
                  className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <SpecialtyModal
          specialty={editingSpecialty}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

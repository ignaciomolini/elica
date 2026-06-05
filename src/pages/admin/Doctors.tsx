import { useState, useEffect } from 'react';
import type { Doctor, Specialty, DoctorFormData } from '../../types';
import { adminApi } from '../../services/api';
import { DoctorModal } from '../../components/admin/DoctorModal';

export function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [doctorsData, specialtiesData] = await Promise.all([
        adminApi.getDoctors(),
        adminApi.getSpecialties(),
      ]);
      setDoctors(doctorsData);
      setSpecialties(specialtiesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data: DoctorFormData) => {
    if (editingDoctor) {
      await adminApi.updateDoctor(editingDoctor.id, data);
    } else {
      await adminApi.createDoctor(data);
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de que queres eliminar este medico?')) return;

    try {
      await adminApi.deleteDoctor(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingDoctor(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando medicos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Medicos</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          Nuevo medico
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No hay medicos registrados
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doctor.avatar || 'https://via.placeholder.com/40'}
                          alt={doctor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium text-gray-900">{doctor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doctor.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialties.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(doctor)}
                          className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <DoctorModal
          doctor={editingDoctor}
          specialties={specialties}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

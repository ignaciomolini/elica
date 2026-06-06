import { useState, useEffect } from 'react';
import type { Doctor, Specialty, DoctorFormData } from '../../types';

interface DoctorModalProps {
  doctor: Doctor | null;
  specialties: Specialty[];
  onSave: (data: DoctorFormData) => Promise<void>;
  onClose: () => void;
}

export function DoctorModal({ doctor, specialties, onSave, onClose }: DoctorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorFormData>({
    name: '',
    email: '',
    password: '',
    bio: '',
    avatar: '',
    specialtyIds: [],
  });

  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name,
        email: doctor.email || '',
        password: '',
        bio: doctor.bio,
        avatar: doctor.avatar,
        specialtyIds: doctor.specialties.map((s) => s.id),
      });
    }
  }, [doctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const data: DoctorFormData = {
        ...form,
        password: !doctor ? form.password : undefined,
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpecialty = (id: string) => {
    setForm((prev) => ({
      ...prev,
      specialtyIds: prev.specialtyIds.includes(id)
        ? prev.specialtyIds.filter((s) => s !== id)
        : [...prev.specialtyIds, id],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {doctor ? 'Editar medico' : 'Nuevo medico'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electronico
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {!doctor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contrasena
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          )}

          {/* Avatar preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de perfil
            </label>
            <div className="flex items-center gap-3">
              {doctor ? (
                <img
                  src={
                    doctor.avatar.startsWith('http')
                      ? doctor.avatar
                      : `http://localhost:3001${doctor.avatar}`
                  }
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                  ?
                </div>
              )}
              <p className="text-sm text-gray-500">
                {doctor
                  ? 'El médico puede cambiar su foto desde su perfil'
                  : 'Se generará un avatar automático con las iniciales'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biografia
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidades
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {specialties.length === 0 && (
                <p className="text-sm text-gray-500">No hay especialidades disponibles</p>
              )}
              {specialties.map((specialty) => (
                <label key={specialty.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.specialtyIds.includes(specialty.id)}
                    onChange={() => toggleSpecialty(specialty.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{specialty.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : doctor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

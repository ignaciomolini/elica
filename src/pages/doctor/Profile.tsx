import { useState } from 'react';
import { useDoctorAuthStore } from '../../store/doctorAuthStore';
import { doctorPanelApi } from '../../services/api';

export function DoctorProfile() {
  const { doctor, setDoctor } = useDoctorAuthStore();
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    bio: doctor?.bio || '',
    avatar: doctor?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await doctorPanelApi.updateProfile({
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
      });
      setDoctor(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi perfil</h1>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de perfil (URL)
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
            {formData.avatar && (
              <img
                src={formData.avatar}
                alt="Preview"
                className="w-24 h-24 rounded-full mt-3 object-cover border-2 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biografia
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-vertical"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              Perfil actualizado correctamente
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

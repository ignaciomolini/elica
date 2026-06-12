import { useState, useEffect } from 'react';
import type { Specialty, SpecialtyFormData } from '../../types';
import { SpecialtyIcon, iconKeys } from '../ui/SpecialtyIcon';

interface SpecialtyModalProps {
  specialty: Specialty | null;
  onSave: (data: SpecialtyFormData) => Promise<void>;
  onClose: () => void;
}

export function SpecialtyModal({ specialty, onSave, onClose }: SpecialtyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SpecialtyFormData>({
    name: '',
    description: '',
    icon: iconKeys[0],
  });

  useEffect(() => {
    if (specialty) {
      setForm({
        name: specialty.name,
        description: specialty.description,
        icon: specialty.icon || iconKeys[0],
      });
    }
  }, [specialty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {specialty ? 'Editar especialidad' : 'Nueva especialidad'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
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
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícono
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, icon: key })}
                  className={`
                    p-2 rounded-lg border-2 transition-all flex items-center justify-center
                    ${form.icon === key
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700'
                    }
                  `}
                  title={key}
                >
                  <SpecialtyIcon name={key} className="w-5 h-5" />
                </button>
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
              {isLoading ? 'Guardando...' : specialty ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

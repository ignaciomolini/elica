import { useState } from 'react';

interface CreateSlotsModalProps {
  date: string;
  onCreate: (startTime: string, endTime: string, interval: number) => void;
  onClose: () => void;
}

export function CreateSlotsModal({ date, onCreate, onClose }: CreateSlotsModalProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [interval, setInterval] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(startTime, endTime, interval);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Agregar horarios</h2>
        <p className="text-sm text-gray-500 mb-6">{formatDate(date)}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora inicio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervalo (minutos)
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Crear horarios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-gray-700 py-2.5 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

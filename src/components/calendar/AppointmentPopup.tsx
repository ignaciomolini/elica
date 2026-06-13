import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types';
import { useCalendarStore } from '../../store/calendarStore';
import { doctorPanelApi } from '../../services/api';
import { getStatusColors } from './statusColors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/Button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Delete02Icon, Edit02Icon, Tick01Icon } from '@hugeicons/core-free-icons';

interface FormData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientDni: string;
}

const initialFormData: FormData = {
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  patientDni: '',
};

export function AppointmentPopup() {
  const { popup, closePopup, fetchAppointments } = useCalendarStore();
  const { open, mode, date, time, appointment } = popup;

  const [form, setForm] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'delete' | null>(null);

  // Populate form when popup opens
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    setConfirmAction(null);

    if (mode === 'edit' && appointment) {
      setForm({
        patientName: appointment.patient?.name ?? '',
        patientEmail: appointment.patient?.email ?? '',
        patientPhone: appointment.patient?.phone ?? '',
        patientDni: appointment.patient?.dni ?? '',
      });
    } else {
      setForm(initialFormData);
    }
  }, [open, mode, appointment]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCreate = async () => {
    if (!form.patientName.trim()) {
      setError('El nombre del paciente es requerido');
      return;
    }
    if (!form.patientEmail.trim()) {
      setError('El email del paciente es requerido');
      return;
    }
    if (!form.patientPhone.trim()) {
      setError('El teléfono del paciente es requerido');
      return;
    }
    if (!form.patientDni.trim()) {
      setError('El DNI del paciente es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Find available time slot for the selected date and time
      const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
      const slots = await doctorPanelApi.getAllSlots(dateStr);

      const slot = slots.find(
        (s) => s.available && s.startTime === time,
      );

      if (!slot) {
        setError('El horario ya no está disponible');
        setSaving(false);
        return;
      }

      await doctorPanelApi.createConfirmedAppointment({
        timeSlotId: slot.id,
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim(),
        patientPhone: form.patientPhone.trim(),
        patientDni: form.patientDni.trim(),
      });

      closePopup();
      fetchAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el turno';
      setError(message);
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!appointment) return;
    if (!form.patientName.trim()) {
      setError('El nombre del paciente es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await doctorPanelApi.updateAppointmentPatient(appointment.id, {
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim(),
        patientPhone: form.patientPhone.trim(),
        patientDni: form.patientDni.trim(),
      });

      closePopup();
      fetchAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar los cambios';
      setError(message);
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!appointment) return;
    setSaving(true);
    setError(null);

    try {
      await doctorPanelApi.updateAppointmentStatus(appointment.id, 'CONFIRMED');
      closePopup();
      fetchAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al confirmar el turno';
      setError(message);
      setSaving(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    setSaving(true);
    setError(null);
    setConfirmAction(null);

    try {
      await doctorPanelApi.updateAppointmentStatus(appointment.id, 'CANCELLED');
      closePopup();
      fetchAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar el turno';
      setError(message);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    setSaving(true);
    setError(null);
    setConfirmAction(null);

    try {
      await doctorPanelApi.deleteAppointment(appointment.id);
      closePopup();
      fetchAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el turno';
      setError(message);
      setSaving(false);
    }
  };

  const dateLabel = date
    ? format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
    : '';

  const isCreate = mode === 'create';
  const isCancelled = appointment?.status === 'CANCELLED';

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) closePopup(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreate ? 'Nuevo turno' : 'Editar turno'}
            </DialogTitle>
            <DialogDescription>
              {isCreate
                ? `Crear turno para el ${dateLabel}${time ? ` a las ${time}` : ''}`
                : `Turno del ${dateLabel} a las ${appointment?.startTime}`}
            </DialogDescription>
          </DialogHeader>

          {/* Status badge in edit mode */}
          {!isCreate && appointment && (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
                  getStatusColors(appointment.status).bg
                } ${getStatusColors(appointment.status).border} ${
                  getStatusColors(appointment.status).text
                }`}
              >
                {getStatusColors(appointment.status).label}
              </span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Patient form */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientName">Nombre del paciente *</Label>
              <Input
                id="patientName"
                placeholder="Nombre completo"
                value={form.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientEmail">Email *</Label>
              <Input
                id="patientEmail"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.patientEmail}
                onChange={(e) => handleChange('patientEmail', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientPhone">Teléfono *</Label>
              <Input
                id="patientPhone"
                type="tel"
                placeholder="+54 11 1234-5678"
                value={form.patientPhone}
                onChange={(e) => handleChange('patientPhone', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientDni">DNI *</Label>
              <Input
                id="patientDni"
                placeholder="12345678"
                value={form.patientDni}
                onChange={(e) => handleChange('patientDni', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Action buttons */}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {isCreate ? (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end w-full">
                <Button variant="outline" onClick={closePopup} disabled={saving}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creando...' : 'Crear turno'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {/* Status action buttons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {appointment?.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      onClick={handleConfirm}
                      disabled={saving}
                    >
                      <HugeiconsIcon icon={Tick01Icon} data-icon="inline-start" />
                      Confirmar
                    </Button>
                  )}
                  {(appointment?.status === 'PENDING' || appointment?.status === 'CONFIRMED') && (
                    <Button
                      variant="outline"
                      onClick={() => setConfirmAction('cancel')}
                      disabled={saving}
                    >
                      Cancelar turno
                    </Button>
                  )}
                </div>

                {/* Save / Delete buttons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {!isCancelled && (
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="!text-red-600 hover:!bg-red-50"
                    onClick={() => setConfirmAction('delete')}
                    disabled={saving}
                  >
                    <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(isOpen) => { if (!isOpen) setConfirmAction(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'cancel' ? '¿Cancelar turno?' : '¿Eliminar turno?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'cancel'
                ? 'Esta acción cambiará el estado del turno a cancelado. El horario quedará libre nuevamente.'
                : 'Esta acción eliminará el turno permanentemente y no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="!bg-red-600 hover:!bg-red-700"
              onClick={confirmAction === 'cancel' ? handleCancelAppointment : handleDelete}
              disabled={saving}
            >
              {confirmAction === 'cancel' ? 'Sí, cancelar' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
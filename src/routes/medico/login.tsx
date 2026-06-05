import { createFileRoute } from '@tanstack/react-router';
import { DoctorLogin } from '../../pages/doctor/Login';

export const Route = createFileRoute('/medico/login')({
  component: DoctorLogin,
});

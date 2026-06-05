import { createFileRoute } from '@tanstack/react-router';
import { Specialties } from '../pages/Specialties';

export const Route = createFileRoute('/especialidades')({
  component: Specialties,
});

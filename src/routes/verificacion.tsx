import { createFileRoute } from '@tanstack/react-router';
import { Verification } from '../pages/Verification';

export const Route = createFileRoute('/verificacion')({
  component: Verification,
});

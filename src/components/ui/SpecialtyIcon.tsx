import {
  Heart, Brain, Eye, Bone, Baby, Stethoscope, Activity,
  FlaskConical, Pill, Syringe, Ear, ScanFace,
  Thermometer, Dna, Microscope, Shield, Ambulance, Hospital,
  PersonStanding, BrainCircuit
} from 'lucide-react';

const iconSize = 'w-6 h-6';

interface IconProps {
  name: string;
  className?: string;
}

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  brain: Brain,
  eye: Eye,
  bone: Bone,
  baby: Baby,
  stethoscope: Stethoscope,
  activity: Activity,
  flask: FlaskConical,
  pill: Pill,
  syringe: Syringe,
  hospital: Hospital,
  ear: Ear,
  scan: ScanFace,
  thermometer: Thermometer,
  dna: Dna,
  microscope: Microscope,
  shield: Shield,
  ambulance: Ambulance,
  'person-standing': PersonStanding,
  'brain-circuit': BrainCircuit,
};

export const iconKeys = Object.keys(icons);

export function SpecialtyIcon({ name, className = iconSize }: IconProps) {
  const IconComponent = icons[name];
  if (IconComponent) return <IconComponent className={className} />;

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

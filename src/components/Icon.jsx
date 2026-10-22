import {
  Atom,
  BookOpen,
  Box,
  CircleDot,
  Crosshair,
  Globe2,
  Hexagon,
  Orbit,
  Shield,
  Swords,
  UserRound,
  Users,
} from 'lucide-react';

const icons = {
  All: Box,
  Faction: Users,
  Character: UserRound,
  Weapon: Swords,
  Spacecraft: Orbit,
  Planet: Globe2,
  archive: BookOpen,
  threat: Crosshair,
  clearance: Shield,
  sigil: Hexagon,
  atom: Atom,
};

export default function Icon({ name, size = 18, ...props }) {
  const Component = icons[name] || CircleDot;
  return <Component size={size} strokeWidth={1.5} aria-hidden="true" {...props} />;
}

export type Species = 'Dragon' | 'Fox' | 'Cat' | 'Dog' | 'Unicorn' | 'Serpent' | 'Rabbit' | 'Panda' | 'Butterfly' | 'Octopus' | 'Turtle' | 'Eagle';

export interface Companion {
  id: number;
  name: string;
  species: Species;
  emoji: string;
  level: number;
  xp: number;
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  vitality: number;
  coins: number;
  collection: Species[];
}

export interface CompanionStats {
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  vitality: number;
}

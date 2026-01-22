export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Adam',
    description: 'Smooth storyteller',
  },
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    description: 'Deep, dramatic',
  },
  {
    id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    description: 'Authoritative',
  },
  {
    id: 'N2lVS1w4EtoT3dr4eOWO',
    name: 'Callum',
    description: 'Mysterious',
  },
  {
    id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    description: 'Engaging host',
  },
  {
    id: 'iP95p4xoKVk53GoZ742B',
    name: 'Chris',
    description: 'Friendly',
  },
];

export const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Adam
export const DEFAULT_SPEED = 1.0;

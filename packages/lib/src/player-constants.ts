export const PLAYER_POSITIONS = [
  'Goalkeeper',
  'Striker',
  'Winger',
  'Left Midfield',
  'Right Midfield',      
  'Central Defender',
  'Central Midfielder',
  'Attacking Midfield',
  'Defensive Midfield',
  'Full Back',
  'Wing Half',  
  'Outside Left',
  'Outside Right',  
  'Inside Forward',        
  'Left Back',
  'Right Back'
] as const;

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

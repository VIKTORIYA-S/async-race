import type { Car } from './car';

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerView extends Winner {
  name: Car['name'];
  color: Car['color'];
}

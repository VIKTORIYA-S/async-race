import type { Car } from "./car";
import type { Winner } from "./winner";


export type View = 'garage' | 'winners';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'wins' | 'time';


export interface SortConfig {
    field: SortField;
    order: SortOrder;
}

export interface PaginationState {
  currentPage: number;
  totalElements: number;
}

export interface EditFormState {
  carId: number | null;
  name: string;
  color: string;
}


export interface AppState {
  view: View;
  cars: Car[];
  winners: Winner[];
  garagePagination: PaginationState;
  winnersPagination: PaginationState;
  editForm: EditFormState;
  createForm: EditFormState;
  winnersSort: SortConfig;
  drivingCarIds: Set<number>;
}


import type { AppState } from '../types/state';

export const initialState: AppState = {
  view: 'garage',
  cars: [],
  winners: [],
  garagePagination: {
    currentPage: 1,
    totalElements: 0,
  },
  winnersPagination: {
    currentPage: 1,
    totalElements: 0,
  },
  editForm: {
    carId: null,
    name: '',
    color: '',
  },
  createForm: {
    carId: null,
    name: '',
    color: '',
  },
  winnersSort: {
    field: 'wins',
    order: 'asc',
  },
  drivingCarIds: new Set(),
};


let state: AppState = initialState;

export function getState(): AppState {
  const cloned: AppState = JSON.parse(JSON.stringify(state));
  cloned.drivingCarIds = new Set(state.drivingCarIds);
  return cloned;
}


export function setState(changes: Partial<AppState>): void {
  state = { ...state, ...changes };
}

import { getState } from "../state/store";
import type { Car } from "../types/car";

export function renderGarage(): HTMLElement {
  const state = getState();

  const container = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = `Гараж (${state.garagePagination.currentPage} из ${state.garagePagination.totalElements})`;
  container.appendChild(title);

  state.cars.forEach((car) => {
    const carElement = renderCarItem(car);
    container.appendChild(carElement);
  });
  return container;
}


function renderCarItem(car: Car): HTMLElement {
  const item = document.createElement("div");
  item.textContent = car.name;
  return item;
}


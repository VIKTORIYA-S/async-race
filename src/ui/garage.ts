import { getState } from "../state/store";

export function renderGarage(): HTMLElement {
  const state = getState();

  const container = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = `Гараж (${state.garagePagination.currentPage} из ${state.garagePagination.totalElements})`;
    container.appendChild(title);
  return container;
}

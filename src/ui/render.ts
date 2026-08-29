import { getState } from "../state/store";
import { renderGarage } from "./garage";
import { renderWinners } from "./winners";

export function render(): void {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Root element #app not found");
  }

  app.innerHTML = "";

  const state = getState();

  if (state.view === "garage") {
    app.appendChild(renderGarage());
  } else {
    app.appendChild(renderWinners());
  }
}
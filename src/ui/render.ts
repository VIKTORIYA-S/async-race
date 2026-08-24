import { getState } from "../state/store";
import { renderGarage } from "./garage";

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
    console.log("rendering winners");
  }
}
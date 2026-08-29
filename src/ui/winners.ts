import { getState } from "../state/store";
import { getWinners } from "../api/winners";
import { getCars } from "../api/cars";
import type { Winner } from "../types/winner";
import type { Car } from "../types/car";
import { setState } from "../state/store";
import { render } from "./render";

export function renderWinners(): HTMLElement {
  const container = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = "Победители";
    container.appendChild(title);

    const switchButton = document.createElement("button");
    switchButton.textContent = "Гараж";
    switchButton.addEventListener("click", () => {
      setState({ view: "garage" });
      render();
    });
    container.appendChild(switchButton);

  loadWinners(container);

  return container;
}

async function loadWinners(container: HTMLElement): Promise<void> {
  const winners: Winner[] = await getWinners();
  const cars: Car[] = await getCars();

  const table = document.createElement("div");

  winners.forEach((winner) => {
    const car = cars.find((c) => c.id === winner.id);
    const row = document.createElement("div");
    row.textContent = `${car ? car.name : "Unknown"} — побед: ${winner.wins}, лучшее время: ${winner.time.toFixed(2)}с`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

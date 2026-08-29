import { getWinners } from "../api/winners";
import { getCars } from "../api/cars";
import type { Winner, WinnerView } from "../types/winner";
import type { Car } from "../types/car";
import { getState, setState } from "../state/store";
import { render } from "./render";

const WINNERS_PER_PAGE = 10;

export function renderWinners(): HTMLElement {
  const container = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = "Победители";
  container.appendChild(title);

  // const subtitle = document.createElement("p");
  // subtitle.textContent = `Всего машин: $`;
  // container.appendChild(subtitle);

  const switchButton = document.createElement("button");
  switchButton.textContent = "Гараж";
  switchButton.addEventListener("click", () => {
    setState({ view: "garage" });
    render();
  });
  container.appendChild(switchButton);

  const content = document.createElement("div");
  container.appendChild(content);

  loadWinners(title, content);

  return container;
}

async function loadWinners(
  title: HTMLElement,
  content: HTMLElement,
): Promise<void> {
  const state = getState();
  const winners: Winner[] = await getWinners();
  const cars: Car[] = await getCars();

  const winnerViews: WinnerView[] = winners.map((winner) => {
    const car = cars.find((c) => c.id === winner.id);
    return {
      ...winner,
      name: car ? car.name : "Unknown",
      color: car ? car.color : "#000000",
    };
  });

  const { field, order } = state.winnersSort;
  winnerViews.sort((a, b) => {
    const diff = a[field] - b[field];
    return order === "asc" ? diff : -diff;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(winnerViews.length / WINNERS_PER_PAGE),
  );
  const currentPage = Math.min(state.winnersPagination.currentPage, totalPages);
  if (currentPage !== state.winnersPagination.currentPage) {
    setState({
      winnersPagination: { ...state.winnersPagination, currentPage },
    });
  }

  title.textContent = `Победители (${currentPage} из ${totalPages})`;

  content.innerHTML = "";
  content.appendChild(renderSortControls());

  const start = (currentPage - 1) * WINNERS_PER_PAGE;
  const end = start + WINNERS_PER_PAGE;
  const pageWinners = winnerViews.slice(start, end);

  const table = document.createElement("div");
  pageWinners.forEach((winner) => {
    const row = document.createElement("div");
    row.textContent = `${winner.name} — побед: ${winner.wins}, лучшее время: ${winner.time.toFixed(2)}с`;
    table.appendChild(row);
  });
  content.appendChild(table);

  content.appendChild(renderPagination(currentPage, totalPages));
}

function renderSortControls(): HTMLElement {
  const state = getState();
  const container = document.createElement("div");

  const winsButton = document.createElement("button");
  const winsArrow =
    state.winnersSort.field === "wins"
      ? state.winnersSort.order === "asc"
        ? "▲"
        : "▼"
      : "";
  winsButton.textContent = `Сортировать по победам ${winsArrow}`;
  winsButton.addEventListener("click", () => {
    toggleSort("wins");
  });
  container.appendChild(winsButton);

  const timeButton = document.createElement("button");
  const timeArrow =
    state.winnersSort.field === "time"
      ? state.winnersSort.order === "asc"
        ? "▲"
        : "▼"
      : "";
  timeButton.textContent = `Сортировать по времени ${timeArrow}`;
  timeButton.addEventListener("click", () => {
    toggleSort("time");
  });
  container.appendChild(timeButton);

  return container;
}

function toggleSort(field: "wins" | "time"): void {
  const state = getState();
  const isSameField = state.winnersSort.field === field;
  const newOrder =
    isSameField && state.winnersSort.order === "asc" ? "desc" : "asc";
  setState({ winnersSort: { field, order: newOrder } });
  render();
}

function renderPagination(
  currentPage: number,
  totalPages: number,
): HTMLElement {
  const container = document.createElement("div");

  const prevButton = document.createElement("button");
  prevButton.textContent = "Назад";
  prevButton.disabled = currentPage <= 1;
  prevButton.addEventListener("click", () => {
    const state = getState();
    setState({
      winnersPagination: {
        ...state.winnersPagination,
        currentPage: currentPage - 1,
      },
    });
    render();
  });
  container.appendChild(prevButton);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Вперед";
  nextButton.disabled = currentPage >= totalPages;
  nextButton.addEventListener("click", () => {
    const state = getState();
    setState({
      winnersPagination: {
        ...state.winnersPagination,
        currentPage: currentPage + 1,
      },
    });
    render();
  });
  container.appendChild(nextButton);

  return container;
}

import { getWinners } from "../api/winners";
import { getCars } from "../api/cars";
import type { Winner, WinnerView } from "../types/winner";
import type { Car } from "../types/car";
import { getState, setState } from "../state/store";
import { render } from "./render";

const WINNERS_PER_PAGE = 10;

export function renderWinners(): HTMLElement {
  const container = document.createElement("div");
  container.className = "page";

  const header = document.createElement("div");
  header.className = "page-header";

  const title = document.createElement("h2");
  title.textContent = "Победители";
  header.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "page-subtitle";
  header.appendChild(subtitle);

  container.appendChild(header);

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";

  const switchButton = document.createElement("button");
  switchButton.className = "btn btn-outline";
  switchButton.textContent = "Гараж";
  switchButton.addEventListener("click", () => {
    setState({ view: "garage" });
    render();
  });
  toolbar.appendChild(switchButton);

  container.appendChild(toolbar);

  const content = document.createElement("div");
  container.appendChild(content);

  loadWinners(title, subtitle, content);

  return container;
}

async function loadWinners(
  title: HTMLElement,
  subtitle: HTMLElement,
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
  subtitle.textContent = `Всего победителей: ${winnerViews.length}`;

  content.innerHTML = "";
  content.appendChild(renderSortControls());

  const start = (currentPage - 1) * WINNERS_PER_PAGE;
  const end = start + WINNERS_PER_PAGE;
  const pageWinners = winnerViews.slice(start, end);

  const table = document.createElement("div");
  table.className = "winners-table";

  pageWinners.forEach((winner, index) => {
    const number = start + index + 1;
    const row = document.createElement("div");
    row.className = "winner-row";

    const numberSpan = document.createElement("span");
    numberSpan.className = "winner-number";
    numberSpan.textContent = `${number}`;
    row.appendChild(numberSpan);

    const carIcon = document.createElement("span");
    carIcon.className = "winner-icon";
    carIcon.innerHTML = `
      <svg viewBox="0 0 64 32" width="40" height="20" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="12" width="56" height="12" rx="3" fill="${winner.color}" />
        <path d="M14 12 L20 4 H44 L50 12 Z" fill="${winner.color}" />
        <circle cx="16" cy="26" r="5" fill="#222" />
        <circle cx="48" cy="26" r="5" fill="#222" />
      </svg>
    `;
    row.appendChild(carIcon);

    const infoSpan = document.createElement("span");
    infoSpan.className = "winner-info";
    infoSpan.textContent = `${winner.name} — побед: ${winner.wins}, лучшее время: ${winner.time.toFixed(2)}с`;
    row.appendChild(infoSpan);

    table.appendChild(row);
  });
  content.appendChild(table);

  content.appendChild(renderPagination(currentPage, totalPages));
}

function renderSortControls(): HTMLElement {
  const state = getState();
  const container = document.createElement("div");
  container.className = "sort-controls";

  const winsButton = document.createElement("button");
  winsButton.className = "btn btn-outline";
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
  timeButton.className = "btn btn-outline";
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
  container.className = "pagination";

  const prevButton = document.createElement("button");
  prevButton.className = "btn btn-outline";
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
  nextButton.className = "btn btn-outline";
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

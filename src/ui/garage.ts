import { getState, setState } from "../state/store";
import type { Car } from "../types/car";
import { deleteCar, getCars, createCar, updateCar } from "../api/cars";
import { render } from "./render";
import { generateCarName, generateCarColor } from "../utils/carGenerator";
import {
  calculateAnimationDuration,
  calculateProgress,
} from "../utils/animation";
import { startEngine, stopEngine } from "../api/engine";
import { drive } from "../api/engine";
import { getWinners, createWinner, updateWinner, deleteWinner } from "../api/winners";

const CARS_PER_PAGE = 7;

export function renderGarage(): HTMLElement {
  const state = getState();

  const container = document.createElement("div");
  container.className = "page";
  const header = document.createElement("div");
  header.className = "page-header";
  const title = document.createElement("h2");
  title.textContent = `Гараж (${state.garagePagination.currentPage} из ${Math.ceil(state.cars.length / CARS_PER_PAGE)})`;
  container.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "page-subtitle";
  subtitle.textContent = `Всего машин: ${state.cars.length}`;
  container.appendChild(subtitle);

  container.appendChild(header);

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";

  const switchButton = document.createElement("button");
  switchButton.className = "btn btn-outline";
  switchButton.textContent = "Победители";
  switchButton.addEventListener("click", () => {
    setState({ view: "winners" });
    render();
  });
  toolbar.appendChild(switchButton);

  const generateButton = document.createElement("button");
  generateButton.className = "btn btn-outline";
  generateButton.textContent = "Сгенерировать 100 машин";
  generateButton.addEventListener("click", () => {
    createListCars();
  });
  toolbar.appendChild(generateButton);

  container.appendChild(toolbar);
  container.appendChild(renderCreateForm());

  const start = (state.garagePagination.currentPage - 1) * CARS_PER_PAGE;
  const end = start + CARS_PER_PAGE;
  const carsOnPage = state.cars.slice(start, end);

  const startAnimations: Array<() => Promise<void>> = [];
  const resetAnimations: Array<() => Promise<void>> = [];

  const raceState = { finished: false };
  carsOnPage.forEach((car) => {
    const { element, startAnimation, resetAnimation } = renderCarItem(
      car,
      raceState,
    );
    container.appendChild(element);
    startAnimations.push(startAnimation);
    resetAnimations.push(resetAnimation);
  });

  const startRaceButton = document.createElement("button");
  startRaceButton.className = "btn btn-race";
  startRaceButton.textContent = "Начать гонку";
  startRaceButton.addEventListener("click", () => {
    raceState.finished = false;
    startAnimations.forEach((startAnimation) => {
      startAnimation();
    });
  });

  const resetRaceButton = document.createElement("button");
  resetRaceButton.className = "btn btn-outline";
  resetRaceButton.textContent = "Сбросить гонку";
  resetRaceButton.addEventListener("click", () => {
    resetAnimations.forEach((resetAnimation) => {
      resetAnimation();
    });
  });

  const raceControls = document.createElement("div");
  raceControls.className = "race-controls";
  raceControls.appendChild(startRaceButton);
  raceControls.appendChild(resetRaceButton);
  container.appendChild(raceControls);

  container.appendChild(renderPagination());

  return container;
}

function renderCarItem(
  car: Car,
  raceState: { finished: boolean },
): {
  element: HTMLElement;
  startAnimation: () => Promise<void>;
  resetAnimation: () => Promise<void>;
} {
  const track = document.createElement("div");
  track.className = "car-track";

  const state = getState();
  const item = document.createElement("div");
  item.className = "car-card";

  const controls = document.createElement("div");
  controls.className = "car-controls";

  const name = document.createElement("span");
    name.className = "car-name";
  name.textContent = car.name;
  item.appendChild(name);

  const colorBox = document.createElement("div");
  let stopped = false;

  colorBox.style.position = "absolute";
  colorBox.style.width = "40px";
  colorBox.style.height = "20px";
  colorBox.style.top = "5px";
  colorBox.innerHTML = `
  <svg viewBox="0 0 64 32" width="40" height="20" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="12" width="56" height="12" rx="3" fill="${car.color}" />
    <path d="M14 12 L20 4 H44 L50 12 Z" fill="${car.color}" />
    <circle cx="16" cy="26" r="5" fill="#222" />
    <circle cx="48" cy="26" r="5" fill="#222" />
  </svg>
`;

  const startButton = document.createElement("button");
  startButton.className = "btn btn-start";
  startButton.textContent = "Старт";
  startButton.disabled = state.drivingCarIds.has(car.id);
  async function startCarAnimation(): Promise<void> {
    stopped = false;
    const { velocity, distance } = await startEngine(car.id);
    const duration = calculateAnimationDuration(distance, velocity);

    setState({ drivingCarIds: new Set(getState().drivingCarIds).add(car.id) });
    startButton.disabled = true;
    stopButton.disabled = false;

    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = calculateProgress(elapsed, duration);
      const x = progress * (track.clientWidth - colorBox.clientWidth);
      colorBox.style.transform = `translateX(${x}px)`;

      if (progress >= 1 && !raceState.finished) {
        raceState.finished = true;
        alert(`Победитель: ${car.name}!`);
        saveWinner(car.id, duration / 1000);
      }

      if (progress < 1 && !stopped) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);

    try {
      await drive(car.id);
    } catch (error) {
      stopped = true;
    }
  }

  startButton.addEventListener("click", startCarAnimation);

  const stopButton = document.createElement("button");
  stopButton.className = "btn btn-outline";
  stopButton.textContent = "Стоп";
  stopButton.disabled = !state.drivingCarIds.has(car.id);
  async function resetCarAnimation(): Promise<void> {
    stopped = true;
    await stopEngine(car.id);
    colorBox.style.transform = "translateX(0)";
    const updatedDrivingCarIds = new Set(getState().drivingCarIds);
    updatedDrivingCarIds.delete(car.id);
    setState({ drivingCarIds: updatedDrivingCarIds });
    startButton.disabled = false;
    stopButton.disabled = true;
  }

  stopButton.addEventListener("click", resetCarAnimation);

  controls.appendChild(startButton);
  controls.appendChild(stopButton);
  track.appendChild(colorBox);

  const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger";
  deleteButton.textContent = "Удалить";
  deleteButton.addEventListener("click", async () => {
    await deleteCar(car.id);
    await deleteWinner(car.id);
    setState({ cars: await getCars() });
    render();
  });
  controls.appendChild(deleteButton);

  const editButton = document.createElement("button");
    editButton.className = "btn btn-outline";
  editButton.textContent = "Изменить";
  editButton.addEventListener("click", () => {
    setState({ editForm: { carId: car.id, name: car.name, color: car.color } });
    render();
  });
  controls.appendChild(editButton);
  item.appendChild(controls);
  item.appendChild(track);

  if (state.editForm.carId === car.id) {
    item.appendChild(renderEditForm());
  }

  return {
    element: item,
    startAnimation: startCarAnimation,
    resetAnimation: resetCarAnimation,
  };
}

function renderCreateForm(): HTMLElement {
  const state = getState();

  const form = document.createElement("div");
  form.className = "form-panel";

  const inputName = document.createElement("input");
  inputName.className = "form-input";
  inputName.value = state.createForm.name;
  inputName.placeholder = "Введите название машины";
  inputName.addEventListener("input", () => {
    const currentForm = getState().createForm;
    setState({ createForm: { ...currentForm, name: inputName.value } });
  });

  const inputColor = document.createElement("input");
  inputColor.className = "form-color";
  inputColor.value = state.createForm.color;
  inputColor.type = "color";
  inputColor.placeholder = "Введите цвет машины";
  inputColor.addEventListener("input", () => {
    const currentForm = getState().createForm;
    setState({ createForm: { ...currentForm, color: inputColor.value } });
  });

  const createButton = document.createElement("button");
  createButton.className = "btn btn-primary";
  createButton.textContent = "Создать";
  createButton.addEventListener("click", async () => {
    if (inputName.value.trim() === "" || inputColor.value.trim() === "") {
      alert("Пожалуйста, заполните все поля.");
      return;
    }
    await createCar(inputName.value, inputColor.value);
    setState({
      cars: await getCars(),
      createForm: { carId: null, name: "", color: "" },
    });
    render();
  });

  form.appendChild(inputName);
  form.appendChild(inputColor);
  form.appendChild(createButton);

  return form;
}

function renderEditForm(): HTMLElement {
  const state = getState();

  const form = document.createElement("div");
  form.className = "form-panel form-panel--edit";

  if (state.editForm.carId === null) {
    return form;
  }
  const carId = state.editForm.carId;

  const inputName = document.createElement("input");
  inputName.className = "form-input";
  inputName.value = state.editForm.name;
  inputName.placeholder = "Введите название машины";
  inputName.addEventListener("input", () => {
    setState({ editForm: { ...getState().editForm, name: inputName.value } });
  });

  const inputColor = document.createElement("input");
  inputColor.className = "form-color";
  inputColor.value = state.editForm.color;
  inputColor.type = "color";
  inputColor.addEventListener("input", () => {
    setState({ editForm: { ...getState().editForm, color: inputColor.value } });
  });

  const createButton = document.createElement("button");
  createButton.className = "btn btn-primary";
  createButton.textContent = "Сохранить";
  createButton.addEventListener("click", async () => {
    if (inputName.value.trim() === "" || inputColor.value.trim() === "") {
      alert("Пожалуйста, заполните все поля.");
      return;
    }
    await updateCar(carId, inputName.value, inputColor.value);
    setState({
      cars: await getCars(),
      editForm: { carId: null, name: "", color: "" },
    });
    render();
  });

  form.appendChild(inputName);
  form.appendChild(inputColor);
  form.appendChild(createButton);

  return form;
}

function renderPagination(): HTMLElement {
  const container = document.createElement("div");
  container.className = "pagination";
  const prevButton = document.createElement("button");
  prevButton.className = "btn btn-outline";
  prevButton.textContent = "Назад";
  prevButton.addEventListener("click", () => {
    const state = getState();
    if (state.garagePagination.currentPage > 1) {
      setState({
        garagePagination: {
          ...state.garagePagination,
          currentPage: state.garagePagination.currentPage - 1,
        },
      });
      render();
    }
  });
  container.appendChild(prevButton);

  const nextButton = document.createElement("button");
  nextButton.className = "btn btn-outline";
  nextButton.textContent = "Вперед";
  nextButton.addEventListener("click", () => {
    const state = getState();
    if (
      state.garagePagination.currentPage * CARS_PER_PAGE <
      state.cars.length
    ) {
      setState({
        garagePagination: {
          ...state.garagePagination,
          currentPage: state.garagePagination.currentPage + 1,
        },
      });
      render();
    }
  });
  container.appendChild(nextButton);

  return container;
}

async function createListCars(): Promise<void> {
  const promises: Promise<Car>[] = [];
  for (let i = 0; i < 100; i++) {
    promises.push(createCar(generateCarName(), generateCarColor()));
  }
  await Promise.all(promises);
  setState({ cars: await getCars() });
  render();
}

async function saveWinner(carId: number, time: number): Promise<void> {
  const winners = await getWinners();
  const existing = winners.find((w) => w.id === carId);

  if (existing) {
    const bestTime = Math.min(existing.time, time);
    await updateWinner(carId, existing.wins + 1, bestTime);
  } else {
    await createWinner(carId, 1, time);
  }
}
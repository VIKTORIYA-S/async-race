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

const CARS_PER_PAGE = 7;

export function renderGarage(): HTMLElement {
  const state = getState();

  const container = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = `Гараж (${state.garagePagination.currentPage} из ${state.cars.length})`;
  container.appendChild(title);
  container.appendChild(renderCreateForm());

  const generateButton = document.createElement("button");
  generateButton.textContent = "Сгенерировать 100 машин";
  generateButton.addEventListener("click", () => {
    createListCars();
  });
  container.appendChild(generateButton);

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
  startRaceButton.textContent = "Начать гонку";
  startRaceButton.addEventListener("click", () => {
    raceState.finished = false;
    startAnimations.forEach((startAnimation) => {
      startAnimation();
    });
  });
  container.appendChild(startRaceButton);

  const resetRaceButton = document.createElement("button");
  resetRaceButton.textContent = "Сбросить гонку";
  resetRaceButton.addEventListener("click", () => {
    resetAnimations.forEach((resetAnimation) => {
      resetAnimation();
    });
  });
  container.appendChild(resetRaceButton);

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
  track.style.position = "relative";
  track.style.width = "100%";
  track.style.height = "30px";
  track.style.backgroundColor = "#ccc";

  const state = getState();
  const item = document.createElement("div");
  const name = document.createElement("span");
  name.textContent = car.name;
  item.appendChild(name);

  const colorBox = document.createElement("div");
  let stopped = false;

  colorBox.style.backgroundColor = car.color;
  colorBox.style.position = "absolute";
  colorBox.style.width = "30px";
  colorBox.style.height = "30px";

  const startButton = document.createElement("button");
  startButton.textContent = "Старт";
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
  stopButton.textContent = "Стоп";
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

  item.appendChild(startButton);
  item.appendChild(stopButton);
  track.appendChild(colorBox);
  item.appendChild(track);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Удалить";
  deleteButton.addEventListener("click", async () => {
    await deleteCar(car.id);
    setState({ cars: await getCars() });
    render();
  });
  item.appendChild(deleteButton);

  const editButton = document.createElement("button");
  editButton.textContent = "Изменить";
  editButton.addEventListener("click", () => {
    setState({ editForm: { carId: car.id, name: car.name, color: car.color } });
    render();
  });
  item.appendChild(editButton);

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

  const inputName = document.createElement("input");
  inputName.value = state.createForm.name;
  inputName.placeholder = "Введите название машины";
  inputName.addEventListener("input", () => {
    setState({ createForm: { ...state.createForm, name: inputName.value } });
  });

  const inputColor = document.createElement("input");
  inputColor.value = state.createForm.color;
  inputColor.type = "color";
  inputColor.placeholder = "Введите цвет машины";
  inputColor.addEventListener("input", () => {
    setState({ createForm: { ...state.createForm, color: inputColor.value } });
  });

  const createButton = document.createElement("button");
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

  if (state.editForm.carId === null) {
    return form;
  }
  const carId = state.editForm.carId;

  const inputName = document.createElement("input");
  inputName.value = state.editForm.name;
  inputName.placeholder = "Введите название машины";
  inputName.addEventListener("input", () => {
    setState({ editForm: { ...state.editForm, name: inputName.value } });
  });

  const inputColor = document.createElement("input");
  inputColor.value = state.editForm.color;
  inputColor.type = "color";
  inputColor.addEventListener("input", () => {
    setState({ editForm: { ...state.editForm, color: inputColor.value } });
  });

  const createButton = document.createElement("button");
  createButton.textContent = "Сохранить";
  createButton.addEventListener("click", async () => {
    if (inputName.value.trim() === "" || inputColor.value.trim() === "") {
      alert("Пожалуйста, заполните все поля.");
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
  const prevButton = document.createElement("button");
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

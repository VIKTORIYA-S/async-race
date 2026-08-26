import { getState } from "../state/store";
import type { Car } from "../types/car";
import { deleteCar, getCars } from "../api/cars";
import { setState } from "../state/store";
import { render } from "./render";

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

  const name = document.createElement("span");
  name.textContent = car.name;
  item.appendChild(name);

  const colorBox = document.createElement("div");
  colorBox.style.backgroundColor = car.color;
  colorBox.style.width = "30px";
  colorBox.style.height = "30px";

  item.appendChild(colorBox);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Удалить";
  deleteButton.addEventListener("click", async () => {
    await deleteCar(car.id);
    setState({ cars: await getCars() });
    render();
  });
  item.appendChild(deleteButton);

  return item;
}

// const createButton = document.createElement("button");
// createButton.textContent = "Создать";
// createButton.addEventListener("click", async () => {
//   await createCar(car.name, car.color);
//   await getCars();
//   setState({ cars: await getCars() });
//   render();
// });
// item.appendChild(createButton);
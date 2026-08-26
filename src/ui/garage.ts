import { getState, setState } from "../state/store";
import type { Car } from "../types/car";
import { deleteCar, getCars, createCar } from "../api/cars";
import { render } from "./render";

export function renderGarage(): HTMLElement {
  const state = getState();

  const container = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = `Гараж (${state.garagePagination.currentPage} из ${state.garagePagination.totalElements})`;
  container.appendChild(title);
  container.appendChild(renderCreateForm());

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
  inputColor.placeholder = "Введите цвет машины";
  inputColor.addEventListener("input", () => {
    setState({ createForm: { ...state.createForm, color: inputColor.value } });
  });

  const createButton = document.createElement("button");
  createButton.textContent = "Создать";
  createButton.addEventListener("click", async () => {
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


import { getState, setState } from "../state/store";
import type { Car } from "../types/car";
import { deleteCar, getCars, createCar, updateCar } from "../api/cars";
import { render } from "./render";

const CARS_PER_PAGE = 7;

export function renderGarage(): HTMLElement {
  const state = getState();

  const container = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = `Гараж (${state.garagePagination.currentPage} из ${state.cars.length})`;
  container.appendChild(title);
  container.appendChild(renderCreateForm());

  const start = (state.garagePagination.currentPage - 1) * CARS_PER_PAGE;
  const end = start + CARS_PER_PAGE;
  const carsOnPage = state.cars.slice(start, end);

  carsOnPage.forEach((car) => {
    const carElement = renderCarItem(car);
    container.appendChild(carElement);
  });
      container.appendChild(renderPagination());

  return container;
}

function renderCarItem(car: Car): HTMLElement {
  const state = getState();
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
    setState({ cars: await getCars(), createForm: { carId: null, name: "", color: "" } });
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
      state.garagePagination.currentPage * CARS_PER_PAGE < state.cars.length
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
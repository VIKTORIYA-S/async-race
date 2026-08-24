import './style.css';
import { render } from "./ui/render";
import { getCars } from "./api/cars";
import { setState } from "./state/store";

export async function init(): Promise<void> {
  const cars = await getCars();
  setState({
    cars,
    garagePagination: { currentPage: 1, totalElements: cars.length },
  });
render();
}

init();


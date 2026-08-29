import type { Car } from '../types/car';
import { BASE_URL } from './config';

export async function getCars(): Promise<Car[]> {
  const response = await fetch(`${BASE_URL}/garage`);
  const data: Car[] = await response.json();
  return data;
}

export async function createCar(name: string, color: string): Promise<Car> {
  const response = await fetch(`${BASE_URL}/garage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  const data: Car = await response.json();
  return data;
}


export async function deleteCar(id: number): Promise<void> {
  await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'DELETE',
  });
}


export async function updateCar(id: number, name: string, color: string): Promise<Car> {
  const response = await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, color }),
  });
  const data: Car = await response.json();
  return data;
}
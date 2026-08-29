import type { Winner } from "../types/winner";
import { BASE_URL } from "./config";

export async function getWinners(): Promise<Winner[]> {
  const response = await fetch(`${BASE_URL}/winners`);
  const data: Winner[] = await response.json();
  return data;
}

export async function createWinner(id: number, wins: number, time: number): Promise<Winner> {
  const response = await fetch(`${BASE_URL}/winners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, wins, time }),
  });
  const data: Winner = await response.json();
  return data;
}

export async function deleteWinner(id: number): Promise<void> {
  await fetch(`${BASE_URL}/winners/${id}`, {
    method: "DELETE",
  });
}


export async function updateWinner(id: number, wins: number, time: number): Promise<Winner> {
  const response = await fetch(`${BASE_URL}/winners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, wins, time }),
  });
  const data: Winner = await response.json();
  return data;
}
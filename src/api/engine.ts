import type { EngineResponse, DriveResponse } from "../types/engine";
import { BASE_URL } from "./config";

export async function startEngine(id: number): Promise<EngineResponse> {
  const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
    method: "PATCH",
  });
  const data: EngineResponse = await response.json();
  return data;
}


export async function stopEngine(id: number): Promise<EngineResponse> {
  const response = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
    method: "PATCH",
  });
  const data: EngineResponse = await response.json();
  return data;
}


export async function drive(id: number): Promise<DriveResponse> {
  const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(`Drive request failed with status ${response.status}`);
  }

  const data: DriveResponse = await response.json();
  return data;
}

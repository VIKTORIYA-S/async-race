const BRANDS = [
  "Tesla",
  "Ford",
  "BMW",
  "Audi",
  "Mersedes",
  "Toyota",
  "Honda",
  "Chevrolet",
  "Nissan",
  "Volkswagen",
];
const MODELS = [
  "Model S",
  "Mustang",
  "X5",
  "A4",
  "C-Class",
  "Corolla",
  "Civic",
  "Camaro",
  "Leaf",
  "Golf",
];

export function generateCarName(): string {
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  const model = MODELS[Math.floor(Math.random() * MODELS.length)];
  return `${brand} ${model}`;
}

export function generateCarColor(): string {
  const randomColor = Math.floor(Math.random() * 0xffffff).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
}



export function calculateAnimationDuration(
  distance: number,
  velocity: number,
): number {
  return distance / velocity;
}

export function calculateProgress(elapsed: number, duration: number): number {
  const progress = elapsed / duration;
  return Math.min(progress, 1);
}

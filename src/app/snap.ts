export function getSnapPoint(config: {
  start: number;
  step: number;
  dimension: number;
}): number {
  const { start, step, dimension } = config;
  const end = start + dimension; // Bottom || Right Side

  const snaps = new Map<number, number>()
    .set(1, start < step ? 0 : Math.abs(start - (start % step))) // Snap 1 Point
    .set(2, Math.abs(start - (start % step) + step)) // Snap 2 Point
    .set(3, Math.abs(end - (end % step))) // Snap 3 Point
    .set(4, Math.abs(end - (end % step)) + step); // Snap 4 Point

  const distance = new Map<number, number>()
    .set(1, Math.abs(start - snaps.get(1)!)) // Distance From Snap 1 to Start
    .set(2, Math.abs(snaps.get(2)! - start)) // Distance From Start to Snap 2
    .set(3, Math.abs(snaps.get(3)! - end)) // Distance From Snap 3 to End
    .set(4, Math.abs(snaps.get(4)! - end)); // Distance From End To Snap 4

  const isCloserToStartDirection = // Get The Minimal Distance To Start Or End
    Math.min(distance.get(1)!, distance.get(2)!) <
    Math.min(distance.get(3)!, distance.get(4)!);

  return isCloserToStartDirection // Get The Best Position For Start
    ? distance.get(1)! < distance.get(2)! // Snap 1 || Snap 2
      ? snaps.get(1)!
      : snaps.get(2)!
    : (distance.get(4)! < distance.get(3)! // Snap 3 || Snap 4
        ? snaps.get(4)!
        : snaps.get(3)!) - dimension;
}

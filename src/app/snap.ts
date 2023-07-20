function getDigitCount(number: number) {
  return Math.max(Math.floor(Math.log10(Math.abs(number))), 0) + 1;
}

export function getDigit(number: number, n: number) {
  const location = getDigitCount(number) + 1 - n;
  return Math.floor((number / Math.pow(10, location - 1)) % 10);
}

export function getPossibleSnapPoints(config: {
  start: number;
  step: number;
  dimension: number;
}): number {
  const { start, step, dimension } = config;
  const end = start + dimension; // Bottom || Right Side

  const snaps = new Map<number, number>()
    .set(1, getDigit(start < step ? 0 : start, 1) * step) // Non-Overlapped Start Snap Point
    .set(2, getDigit(start < step ? 0 : start, 1) * step + step) // Overlapped Start Snap Point
    .set(3, getDigit(end < step ? 0 : end - step, 1) * step + step) // Overlapped End Snap Point
    .set(4, (getDigit(end, 1) + 1) * step); // Non-Overlapped End Snap Point

  const distance = new Map<number, number>()
    .set(1, Math.abs(start - snaps.get(1)!))
    .set(2, Math.abs(snaps.get(2)! - start))
    .set(3, Math.abs(snaps.get(3)! - end))
    .set(4, Math.abs(snaps.get(4)! - end));

  const isCloserToStartDirection =
    Math.min(distance.get(1)!, distance.get(2)!) <
    Math.min(distance.get(3)!, distance.get(4)!);

  return isCloserToStartDirection
    ? distance.get(1)! < distance.get(2)!
      ? snaps.get(1)!
      : snaps.get(2)!
    : (distance.get(4)! < distance.get(3)! ? snaps.get(4)! : snaps.get(3)!) -
        dimension;
}

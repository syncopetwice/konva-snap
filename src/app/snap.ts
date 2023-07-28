import { Distance, Snaps } from './interfaces';

function getClosestSnapPoint(
  vertices: Array<number>,
  point: number
): { v: number; i: number } {
  const closestPoint = vertices.reduce((prev, curr) => {
    return Math.abs(curr - point) < Math.abs(prev - point) ? curr : prev;
  });
  return {
    v: closestPoint,
    i: vertices.findIndex((v) => v === closestPoint),
  };
}

function getSnapPoints(
  vertices: Array<number>,
  start: number,
  dimension: number
): Snaps {
  const worker: Worker = new Worker(new URL('./app.worker', import.meta.url));

  // worker.postMessage({ vertices, start, dimension });

  // worker.onmessage = ({ data }) => {
  //   console.log(`page got message: ${data}`);
  // };

  // Start the timer
  const st = performance.now();

  // Call the function

  const _snapBefore = getClosestSnapPoint(vertices, start);
  const _snapAfter = getClosestSnapPoint(vertices, start + dimension);
  console.log('Vertices', vertices, _snapBefore.v, _snapAfter.v);

  const snaps: Snaps = {
    before: _snapBefore.v,
    prev:
      (Math.abs(
        [...vertices][_snapBefore.i - 1] - [...vertices][_snapBefore.i]
      ) > dimension
        ? _snapBefore.v
        : [...vertices][_snapBefore.i - 1]) || 0,
    next:
      Math.abs([...vertices][_snapAfter.i - 1] - [...vertices][_snapAfter.i]) >
      dimension
        ? _snapAfter.v
        : [...vertices][_snapAfter.i - 1],
    after: _snapAfter.v,
  };

  // Stop the timer
  const end = performance.now();

  // Calculate the elapsed time
  const elapsed = end - st;

  console.log('Elapsed', elapsed);

  return snaps;
}

function getDistances(
  snaps: Snaps,
  start: number,
  dimension: number
): Distance {
  return {
    fromSnapToStart: Math.abs(start - snaps.before), // Distance From Snap 1 to Start,
    fromStartToSnap: Math.abs(snaps.prev - start), // Distance From Start to Snap 2,
    fromSnapToEnd: Math.abs(snaps.next - start + dimension), // Distance From Snap 3 to End,
    fromEndToSnap: Math.abs(snaps.after - start + dimension), // Distance From End To Snap 4,
  };
}

export function getSnapPoint(config: {
  start: number;
  dimension: number;
  vertices: Set<number>;
}): number {
  let { start, dimension, vertices } = config;

  const snaps = getSnapPoints(
    [...vertices].sort((a: number, b: number) => a - b),
    start,
    dimension
  );

  // console.group('Snaps');
  // console.log('before', snaps.before);
  // console.log('prev', snaps.prev);
  // console.log('next', snaps.next);
  // console.log('after', snaps.after);
  // console.groupEnd();

  const distance = getDistances(snaps, start, dimension);

  const isCloserToStartDirection = // Get The Minimal Distance To Start Or End
    Math.min(distance.fromSnapToStart, distance.fromStartToSnap) <
    Math.min(distance.fromSnapToEnd, distance.fromEndToSnap);

  const result = isCloserToStartDirection // Get The Best Position For Start
    ? distance.fromSnapToStart < distance.fromStartToSnap // Snap 1 || Snap 2
      ? distance.fromSnapToStart
      : distance.fromStartToSnap
    : distance.fromEndToSnap < distance.fromSnapToEnd // Snap 3 || Snap 4
    ? distance.fromEndToSnap
    : distance.fromSnapToEnd - dimension;

  return result;
}

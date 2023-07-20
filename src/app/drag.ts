import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Stage } from 'konva/lib/Stage';
import { getPossibleSnapPoints } from './snap';

function getClosestGridX(config: {
  shape: Shape<ShapeConfig> | Stage;
  step: number;
}): number {
  return getPossibleSnapPoints({
    start: config.shape.x(),
    step: config.step,
    dimension: config.shape.width(),
  });
}

function getClosestGridY(config: {
  shape: Shape<ShapeConfig> | Stage;
  step: number;
}): number {
  return getPossibleSnapPoints({
    start: config.shape.y(),
    step: config.step,
    dimension: config.shape.height(),
  });
}

export function handleDragEnd(config: {
  shape: Stage | Shape<ShapeConfig>;
  step: number;
}): void {
  config.shape.position({
    x: getClosestGridX({ shape: config.shape, step: config.step }),
    y: getClosestGridY({ shape: config.shape, step: config.step }),
  });
}

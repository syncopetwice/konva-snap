import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Stage } from 'konva/lib/Stage';
import { getSnapPoint } from './snap';

export function handleDragEnd(config: {
  shape: Stage | Shape<ShapeConfig>;
  step: number;
}): void {
  config.shape.position({
    x: getSnapPoint({
      start: config.shape.x(),
      step: config.step,
      dimension: config.shape.width(),
    }),
    y: getSnapPoint({
      start: config.shape.y(),
      step: config.step,
      dimension: config.shape.height(),
    }),
  });
}

import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Stage } from 'konva/lib/Stage';
import { getSnapPoint } from './snap';
import { Layer } from 'konva/lib/Layer';
import { Group } from 'konva/lib/Group';
import { Rect, RectConfig } from 'konva/lib/shapes/Rect';
import { Line, LineConfig } from 'konva/lib/shapes/Line';
import { Display, Vertices } from './interfaces';
import { Transformer } from 'konva/lib/shapes/Transformer';

export function handleDragEnd(config: {
  shape: Stage | Shape<ShapeConfig>;
  step: number;
  group: Group;
  verticesLayerGroup: Group;
  vertices: Vertices;
}): void {
  config.shape.position({
    x: getSnapPoint({
      start: config.shape.x(),
      step: config.step,
      dimension: config.shape.width(),
      vertices: config.vertices,
    }),
    y: getSnapPoint({
      start: config.shape.y(),
      step: config.step,
      dimension: config.shape.height(),
      vertices: config.vertices,
    }),
  });
  config.shape.moveTo(config.group);
  config.verticesLayerGroup.destroyChildren();
}

export function handleClick(config: {
  shape: Stage | Shape<ShapeConfig>;
  group: Group;
  step: number;
  transformer: Transformer;
}) {
  const tolerance: number = 10;

  // config.tr`ansformer.nodes(config.shape);

  const transformer = new Transformer({
    nodes: [config.shape],
    rotateEnabled: false,
    keepRatio: false,
    anchorStroke: '#7393B3',
    anchorStrokeWidth: 4,
    anchorSize: 16,
    borderEnabled: false,
    anchorCornerRadius: 16,
    anchorDragBoundFunc: (prev: any, next: any, e: any) => {
      let distance = Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2)
      );

      if (distance > tolerance) {
        return next;
      }

      const closestX = Math.ceil(next.x / config.step) * config.step;
      const diffX = Math.ceil(Math.abs(next.x - closestX));

      const closestY = Math.ceil(next.y / config.step) * config.step;
      const diffY = Math.ceil(Math.abs(next.y - closestY));

      const snappedX = diffX < tolerance;
      const snappedY = diffY < tolerance;

      // console.group('Anchor Drag Bound');
      // console.log('distance', distance);
      // console.log('closestX', closestX);
      // console.log('diffX', diffX);
      // console.log('closestY', closestY);
      // console.log('diffY', diffY);
      // console.log('snappedX', snappedX);
      // console.log('snappedY', snappedY);
      // console.groupEnd();

      if (snappedX && !snappedY) {
        return {
          x: closestX,
          y: prev.y,
        };
      } else if (snappedY && !snappedX) {
        return {
          x: prev.x,
          y: closestY,
        };
      } else if (snappedX && snappedY) {
        return {
          x: closestX,
          y: closestY,
        };
      }
      return next;
    },
  });
  config.group.add(transformer);
}

export function handleDragStart(config: {
  shape: Stage | Shape<ShapeConfig>;
  dragLayerGroup: Group;
  gridLayerGroup: Group;
  stage: Stage;
  display: Display;
  vertices: Vertices;
  verticesLayerGroup: Group;
}): void {
  if (config.verticesLayerGroup?.hasChildren()) {
    config.verticesLayerGroup.destroyChildren;
  }
  const lines = [];

  console.log('V', config.vertices.vertical);
  console.log('H', config.vertices.horizontal);

  for (let i = 0; i < [...config.vertices.horizontal].length; i++) {
    lines.push(
      new Line({
        points: [
          0,
          [...config.vertices.horizontal][i],
          config.display.w,
          [...config.vertices.horizontal][i],
        ],
        strokeWidth: 1,
        stroke: 'red',
        opacity: 0.75,
      })
    );
  }

  for (let i = 0; i < [...config.vertices.vertical].length; i++) {
    lines.push(
      new Line({
        points: [
          [...config.vertices.vertical][i],
          0,
          [...config.vertices.vertical][i],
          config.display.h,
        ],
        strokeWidth: 1,
        stroke: 'red',
        opacity: 0.75,
      })
    );
  }

  config.verticesLayerGroup.add(...lines);
  config.shape.moveTo(config.dragLayerGroup);
}

export function handleDragMove(config: {
  shape: Stage | Shape<ShapeConfig>;
  group: Group;
  display: Display;
}): void {
  const lines = config.group.find('.Line');
  for (let index = 0; index < lines.length; index++) {
    lines[index].destroy();
  }
  config.group.add(
    new Line({
      name: 'Line',
      points: [config.shape.x(), 0, config.shape.x(), config.display.h],
      stroke: 'pink',
      strokeWidth: 1,
    }),
    new Line({
      name: 'Line',
      points: [
        config.shape.x() + config.shape.width(),
        0,
        config.shape.x() + config.shape.width(),
        config.display.h,
      ],
      stroke: 'pink',
      strokeWidth: 1,
    }),
    new Line({
      name: 'Line',
      points: [0, config.shape.y(), config.display.w, config.shape.y()],
      stroke: 'pink',
      strokeWidth: 1,
    }),
    new Line({
      name: 'Line',
      points: [
        0,
        config.shape.y() + config.shape.height(),
        config.display.w,
        config.shape.y() + config.shape.height(),
      ],
      stroke: 'pink',
      strokeWidth: 1,
    })
  );
}

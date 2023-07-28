import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Stage } from 'konva/lib/Stage';
import { getSnapPoint } from './snap';
import { Layer } from 'konva/lib/Layer';
import { Group } from 'konva/lib/Group';
import { Rect, RectConfig } from 'konva/lib/shapes/Rect';
import { Line, LineConfig } from 'konva/lib/shapes/Line';
import { Display, Vertices } from './interfaces';
import { Transformer, TransformerConfig } from 'konva/lib/shapes/Transformer';
import { getTransformer } from './transformer';

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
      dimension: config.shape.width(),
      vertices: config.vertices.vertical,
    }),
    y: config.step,
    // y: getSnapPoint({
    //   start: config.shape.y(),
    //   dimension: config.shape.height(),
    //   vertices: config.vertices.horizontal,
    // }),
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
  config.transformer.nodes([config.shape]);
  config.group.add(config.transformer);
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

  // console.log('V', config.vertices.vertical);
  // console.log('H', config.vertices.horizontal);

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
        stroke:
          [...config.vertices.horizontal][i] === config.display.h / 2
            ? 'blue'
            : 'red',
        opacity: 0.25,
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
        stroke:
          [...config.vertices.horizontal][i] === config.display.h / 2
            ? 'blue'
            : 'red',
        opacity: 0.25,
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

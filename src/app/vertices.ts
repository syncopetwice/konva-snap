import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Vertices } from './interfaces';
import { Stage } from 'konva/lib/Stage';
import { NodeConfig, Node } from 'konva/lib/Node';

export function getShapesVertices(shapes: Array<Node<NodeConfig>>): Vertices {
  const vertices: Vertices = {
    vertical: new Set(),
    horizontal: new Set(),
  };
  for (let index = 0; index < shapes.length; index++) {
    const shape = shapes[index];
    vertices.vertical
      .add(shape.x())
      .add(shape.x() + shape.width())
      .add(shape.x() + shape.width() / 2);
    vertices.horizontal
      .add(shape.y())
      .add(shape.y() + shape.height())
      .add(shape.y() + shape.height() / 2);
  }
  return vertices;
}

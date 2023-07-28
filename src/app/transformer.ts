import { TransformerConfig } from 'konva/lib/shapes/Transformer';

export function getTransformer(step: number): TransformerConfig {
  const tolerance: number = 10;
  return {
    rotateEnabled: false,
    keepRatio: false,
    anchorStroke: '#7393B3',
    anchorStrokeWidth: 4,
    anchorSize: 8,
    borderEnabled: false,
    anchorCornerRadius: 16,
    anchorDragBoundFunc: (prev: any, next: any, e: any) => {
      let distance = Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2)
      );

      if (distance > tolerance) {
        return next;
      }

      const closestX = Math.ceil(next.x / step) * step;
      const diffX = Math.ceil(Math.abs(next.x - closestX));

      const closestY = Math.ceil(next.y / step) * step;
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
  };
}

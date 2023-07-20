import { KonvaEventObject } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';

export function handleWheel(config: {
  e: KonvaEventObject<WheelEvent>;
  stage: Stage;
}): void {
  const { e, stage } = config;

  e.evt.preventDefault();

  let scaleBy = 1.02;

  let oldScale = stage.scaleX();
  let pointer = stage.getPointerPosition();

  let mousePointTo = {
    x: (pointer!.x - stage.x()) / oldScale,
    y: (pointer!.y - stage.y()) / oldScale,
  };

  let direction = e.evt.deltaY > 0 ? 1 : -1;

  if (e.evt.ctrlKey) {
    direction = -direction;
  }

  let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });

  let newPos = {
    x: pointer!.x - mousePointTo.x * newScale,
    y: pointer!.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
}

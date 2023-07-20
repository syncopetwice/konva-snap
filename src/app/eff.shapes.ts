import { KonvaEventObject } from "konva/lib/Node";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";
import { KonvaNodeEvent } from "konva/lib/types";

export namespace Eff {
  export class Rectangle extends Rect {
    constructor(config: RectConfig) {
      super(config);
      this.on(KonvaNodeEvent.dragend, (e: KonvaEventObject<MouseEvent>) => {
        const target = {
          x: e.target.x(),
          y: e.target.y(),
          w: e.target.x() + e.target.width(),
          h: e.target.y() + e.target.height(),
        };
        this.setPosition({
          x: target.x + 50,
          y: target.y + 50,
        });
      });
    }
  }
}

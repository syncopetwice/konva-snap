import { saveAs } from 'file-saver';
import Konva from 'konva';
import { KonvaEventObject, NodeConfig, Node } from 'konva/lib/Node';
import { ShapeConfig } from 'konva/lib/Shape';

export function getShapeScreenshot(target: Node<NodeConfig>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let clone = target.clone();
    let group = new Konva.Group();
    const cr = clone.getClientRect();
    let rect = new Konva.Rect({
      width: clone.clipWidth(),
      height: clone.clipHeight(),
      x: cr.x,
      y: cr.y,
      fill: '#fff',
    });
    group.add(rect, clone);
    const image = group.toDataURL({
      pixelRatio: 1,
      quality: 1,
      mimeType: 'image/png',
      width: clone.clipWidth(),
      height: clone.clipHeight(),
    });
    downloadImageFile(image);
    group.destroy();
    resolve(image), reject(new Error('Cannot get the shape screenshot'));
  });
}

export function downloadImageFile(
  uri: string,
  filename: string = 'screenshot'
) {
  saveAs(uri, filename);
}

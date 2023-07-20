import { saveAs } from 'file-saver';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

export function getShapeScreenshot(
  e: KonvaEventObject<DragEvent | MouseEvent>
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let clone = e.target.clone();
    let group = new Konva.Group();
    const cr = clone.getClientRect();
    let rect = new Konva.Rect({
      width: cr.width,
      height: cr.height,
      x: cr.x,
      y: cr.y,
      fill: '#fff',
    });
    group.add(rect, clone);
    const image = group.toDataURL({
      pixelRatio: 4,
      quality: 1,
      mimeType: 'image/png',
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

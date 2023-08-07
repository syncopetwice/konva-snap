import { Group } from 'konva/lib/Group';
import { Image } from 'konva/lib/shapes/Image';
import { Rect } from 'konva/lib/shapes/Rect';
import { KonvaEventObject, NodeConfig, Node } from 'konva/lib/Node';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';
import { Grayscale } from 'konva/lib/filters/Grayscale';
import { getShapeScreenshot } from './getShapeScreenshot';
import { Circle } from 'konva/lib/shapes/Circle';

const color: string = '#1F51FF';

const clipImageGroup: Group = new Group({
  draggable: true,
  x: 300,
  y: 300,
});

let clipImage!: Image;

const clipImageContainer: Group = new Group();

const clipImageMask: Circle = new Circle({
  fill: color,
  opacity: 1,
});

const clipImageMaskOverlay: Rect = new Rect({
  fill: color,
  opacity: 0.5,
});

const clipImageMaskTransformer: Transformer = new Transformer({
  rotateEnabled: false,
  anchorCornerRadius: 20,
  anchorFill: color,
  anchorStroke: color,
  borderStroke: color,
  borderStrokeWidth: 2,
  keepRatio: true,
});

const clipImageMaskGroup: Group = new Group({
  keepRatio: true,
  draggable: true,
});

function getCircleRadiusInSquare(width: number, height: number): number {
  return width > height ? height / 2 : width / 2;
}

const url: string =
  'https://pbs.twimg.com/media/FCJe3B0X0Ag1CWk?format=jpg&name=large';

export function getImageGroup(stage: Stage): Group {
  Image.fromURL(url, (node) => {
    clipImage = node;

    clipImage.setAttrs({
      x: 0,
      y: 0,
      width: node.width() / 4,
      height: node.height() / 4,
      cornerRadius: 200,
      stroke: 'red',
      strokeWidth: 20,
      shadowColor: 'black',
      shadowBlur: 20,
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.5,
    });

    clipImageContainer.add(clipImage);

    clipImageMask.setAttrs({
      radius: Math.min(clipImage.width(), clipImage.height()) / 2,
      x: clipImage.width() / 2,
      y: clipImage.height() / 2,
      visible: false,
    });

    clipImageMaskOverlay.setAttrs({
      width: clipImageMask.width(),
      height: clipImageMask.height(),
      x: clipImageMask.x() - clipImageMask.width() / 2,
      y: clipImageMask.y() - clipImageMask.height() / 2,
      visible: false,
    });

    clipImageMaskGroup.add(clipImageMaskOverlay, clipImageMask);

    clipImageGroup.add(clipImageContainer, clipImageMaskGroup);
  });

  clipImageContainer.on('dblclick', (e: KonvaEventObject<MouseEvent>) => {
    var container = stage.container();
    container.tabIndex = 1;
    container.focus();
    clipImageMask.visible(true);
    clipImageMask.fill(color);
    clipImageMaskOverlay.visible(true);
    clipImageMaskTransformer.nodes([clipImageMaskGroup]);
    clipImageGroup.add(clipImageMaskTransformer);
    clipImageContainer.cache();
    clipImageContainer.filters([Grayscale]);

    clipImageMaskTransformer.on(
      'transform',
      (e: KonvaEventObject<MouseEvent>) => {
        clipImageContainer.clip({
          x: e.target.x(),
          y: e.target.y(),
          width: e.currentTarget.width(),
          height: e.currentTarget.height(),
        });
        clipImageContainer.width(e.currentTarget.width());
        clipImageContainer.height(e.currentTarget.height());
      }
    );
    container.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        console.log('clipImageContainer', clipImageContainer);
        const x = 100,
          y = 100,
          width = 200,
          height = 200;
        const cornerRadius = 100;

        clipImageContainer.clearCache();
        clipImageContainer.clipFunc((ctx) => {
          ctx.beginPath();
          ctx.moveTo(x + cornerRadius, y);
          ctx.lineTo(x + width - cornerRadius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
          ctx.lineTo(x + width, y + height - cornerRadius);
          ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - cornerRadius,
            y + height
          );
          ctx.lineTo(x + cornerRadius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
          ctx.lineTo(x, y + cornerRadius);
          ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
          ctx.closePath();
        });
        clipImageContainer.clip({
          x: 50,
          y: 50,
          width: 300,
          height: 300,
        });
        console.log('clipImageMaskGroup', clipImageMaskGroup);
        clipImageMaskGroup.visible(false);
        clipImageMaskTransformer.nodes([]);
        clipImageMaskGroup.draggable(false);
        clipImageContainer.filters([]);
      }
    });
  });

  return clipImageGroup;
}

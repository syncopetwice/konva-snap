import {
  Component,
  AfterViewInit,
  ChangeDetectionStrategy,
  NgZone,
  inject,
  HostListener,
} from '@angular/core';

import { Group } from 'konva/lib/Group';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';
import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';
import { Image } from 'konva/lib/shapes/Image';
import { Util } from 'konva/lib/Util';
import { KonvaEventObject, NodeConfig, Node } from 'konva/lib/Node';

import { Display, GridConfig, Vertices } from './interfaces';
import { handleClick, handleDragEnd, handleDragStart } from './drag';
import { handleWheel } from './zoom';
import { Shape } from 'konva/lib/Shape';
import { getShapesVertices } from './vertices';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { getTransformer } from './transformer';
import { getImageGroup } from './crop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  constructor() {}

  private ngZone = inject(NgZone);

  public group = new Group({
    x: 300,
    y: 40,
    width: 600,
    height: 200,
  });

  private layer = new Layer();

  private transformer = new Transformer({
    draggable: true,
  });

  private stage!: Stage;
  private display!: Display;

  private initializeStage(config: { containerId: string }): void {
    this.ngZone.runOutsideAngular(() => {
      const { innerWidth, innerHeight } = window;
      this.display = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
      this.stage = new Stage({
        id: 'Stage',
        container: config.containerId,
        width: innerWidth,
        height: innerHeight,
      });
      this.stage.add(this.layer);
      this.layer.add(this.group);
      this.addImage(
        this.group,
        'https://pbs.twimg.com/media/FB1SrdtXoAMYeiG.jpg'
      );
      // this.addImage(
      //   this.group2,
      //   'https://pbs.twimg.com/media/FB1SrdtXoAMYeiG.jpg'
      // );
      // this.addImage(
      //   this.group3,
      //   'https://www.gamereactor.pl/media/68/teamspirittake_4076813.jpg'
      // );
      // this.addImage(
      //   this.group4,
      //   'https://www.gamereactor.pl/media/68/teamspirittake_4076813.jpg'
      // );
      // this.addReferenceImage(this.layer);
    });
  }

  public addReferenceImage(layer: Layer): void {
    Image.fromURL(
      'https://pbs.twimg.com/media/FB1SrdtXoAMYeiG.jpg',
      (image: Image) => {
        image.x(1000);
        this.layer.add(image);
      }
    );
  }

  public applyCrop(pos: string, image: Image): void {
    // const img = this.layer.findOne('.image');
    image.setAttr('lastCropUsed', pos);
    const crop = this.getCrop(image, {
      width: image.width(),
      height: image.height(),
    });
    image.setAttrs(crop);
  }

  public getCrop(image: Image, size: { width: number; height: number }) {
    const width = size.width;
    const height = size.height;
    const aspectRatio = width / height;

    let newWidth;
    let newHeight;

    const imageRatio = image.width() / image.height();

    if (aspectRatio >= imageRatio) {
      newWidth = image.width();
      newHeight = image.width() / aspectRatio;
    } else {
      newWidth = image.height() * aspectRatio;
      newHeight = image.height();
    }

    let x = 0;
    let y = 0;
    x = (image.width() - newWidth) / 2;
    y = (image.height() - newHeight) / 2;

    return {
      cropX: x,
      cropY: y,
      cropWidth: newWidth,
      cropHeight: newHeight,
    };
  }

  public addImage(group: Group, url: string): void {
    Image.fromURL(url, (img: Image) => {
      this.applyCrop('center-middle', img);
      console.log('Im', img);

      img.setAttrs({
        name: 'image',
        draggable: true,
      });

      group.add(img);

      const tr = new Transformer({
        nodes: [img],
        keepRatio: false,
        boundBoxFunc: (oldBox, newBox) => {
          if (newBox.width < 10 || newBox.height < 10) {
            return oldBox;
          }
          return newBox;
        },
      });

      group.add(tr);

      img.on('transform', () => {
        // reset scale on transform
        img.setAttrs({
          scaleX: 1,
          scaleY: 1,
          width: img.width() * img.scaleX(),
          height: img.height() * img.scaleY(),
        });
        this.applyCrop(img.getAttr('lastCropUsed'), img);
      });

      // group.add(image);
    });
  }

  private getImageAttributes({
    image,
    group,
  }: {
    image: Image;
    group: Group;
  }): {
    width: number;
    height: number;
    x: number;
    y: number;
  } {
    const { width: iw, height: ih } = image.getClientRect();
    const { width: gw, height: gh } = group.getAttrs();

    if (gw >= gh) {
      if (iw >= ih) {
        const sw: number = (iw * gh) / ih;
        const sh: number = gh;

        console.group('Image');
        console.log('Group', gw, gh);
        console.log('Image', iw, ih);
        console.log('Scaled Image', sw, sh);
        console.groupEnd();

        if (sw >= gw) {
          return {
            width: sw,
            height: sh,
            x: gw / 2 - sw / 2,
            y: gh / 2 - sh / 2,
          };
        } else {
          return {
            width: gw,
            height: (gh * sw) / sh,
            x: 0,
            y: gh / 2 - gh / 2,
          };
        }
      }
    }

    return {
      width: gw,
      height: gh,
      x: 0,
      y: 0,
    };
  }

  public ngAfterViewInit(): void {
    this.initializeStage({ containerId: 'container' });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.stage.setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }
}

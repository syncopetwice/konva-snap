import {
  Component,
  AfterViewInit,
  Renderer2,
  NgZone,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Subject } from 'rxjs';

import { screenshotShape } from './getShapeScreenshot';

import { KonvaNodeEvent, Vector2d } from 'konva/lib/types';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { KonvaEventObject } from 'konva/lib/Node';
import { Group } from 'konva/lib/Group';
import { Rect } from 'konva/lib/shapes/Rect';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';
import { Line } from 'konva/lib/shapes/Line';
import { Circle } from 'konva/lib/shapes/Circle';
import { Text } from 'konva/lib/shapes/Text';
import { Image } from 'konva/lib/shapes/Image';
import Quill from 'quill';
import { Context } from 'konva/lib/Context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  constructor(
    private renderer: Renderer2,
    private zone: NgZone,
    public viewContainerRef: ViewContainerRef
  ) {}

  public stage!: Stage;

  private gridLayerGroup = new Group({ listening: false });
  private gridLayer = new Layer({ listening: false });

  private canvasLayerGroup: Group = new Group({
    draggable: true,
  });
  private canvasLayer: Layer = new Layer({});

  private draggableGroup: Group = new Group();
  private draggableLayer: Layer = new Layer();

  private rulerLayerGroup: Group = new Group();
  private rulerLayer: Layer = new Layer();

  private image!: Image;

  private step: number = 50;
  public useSnapToGrid: boolean = true;

  private scale!: number;

  private state$: Subject<null> = new Subject();

  public images: string[] = [];

  public draw() {
    // const r = new Text({
    //   text: 'Chester Silver Versailles Porcelain Wall and Floor Tile',
    //   fontFamily: 'Arial',
    //   fontSize: 24,
    //   fontStyle: 'bold',
    //   lineHeight: 1.25,
    //   width: 350,
    // })

    // r.getWidth();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.stage = new Stage({
      container: 'container',
      width: width,
      height: height,
    });
    this.canvasLayer.add(this.canvasLayerGroup);
    this.stage.add(
      this.gridLayer,
      this.canvasLayer,
      this.draggableLayer,
      this.rulerLayer
    );
    // this.stage.on('wheel', (e) => this.handleScrollDirectionScaleChange(e));
    this.generateGrid();
    this.createItemBox(this.canvasLayer);
  }

  private addRectangle(group: Group): void {
    let rectangle = new Rect({
      x: 10,
      y: 10,
      width: 300,
      height: 200,
      fill: 'pink',
      draggable: true,
    });
    rectangle.on('dragend', (e) =>
      screenshotShape(e).then((image) => this.addItemToSidebar(image))
    );
    rectangle.on('dblclick', (e) =>
      screenshotShape(e).then((image) => this.addItemToSidebar(image))
    );
    group.add(rectangle);
  }

  private onShapeDragStart(group: Group): void {
    const { x, y, width, height } = group.getClientRect();

    let { innerWidth, innerHeight } = window;

    innerWidth *= 10;
    innerHeight *= 10;

    const padding = 0;

    let _background = new Rect({
      x: x - padding,
      y: y - padding,
      width: width + padding * 2,
      height: height + padding * 2,
      fill: 'rgba(0,0,255,0.25)',
    });

    let _tLine = new Line({
      points: [0 - innerWidth / 2, y, innerWidth, y],
      strokeWidth: 1,
      stroke: 'rgba(0,0,255,0.5)',
      dash: [33, 10],
    });

    let _rLine = new Line({
      points: [x + width, 0 - innerHeight / 2, x + width, innerHeight],
      strokeWidth: 1,
      stroke: 'rgba(0,0,255,0.5)',
      dash: [33, 10],
    });

    let _bLine = new Line({
      points: [0 - innerWidth / 2, y + height, innerWidth, y + height],
      strokeWidth: 1,
      stroke: 'rgba(0,0,255,0.5)',
      dash: [33, 10],
    });

    let _lLine = new Line({
      points: [x, 0 - innerHeight / 2, x, innerHeight],
      strokeWidth: 1,
      stroke: 'rgba(0,0,255,0.5)',
      dash: [33, 10],
    });

    this.draggableGroup
      .add(_background, group.clone(), _tLine, _rLine, _lLine, _bLine)
      .moveTo(this.draggableLayer);
    group.hide();
    this.draggableGroup.cache();
  }

  private onShapeDragMove(group: Group, e: KonvaEventObject<DragEvent>): void {
    this.draggableGroup.clearCache();
    this.draggableGroup.setPosition(group.getAbsolutePosition());
  }

  private onShapeDragEnd(group: Group): void {
    group.position({
      x: Math.round(group.x() / this.step) * this.step,
      y: Math.round(group.y() / this.step) * this.step,
    });
    group.show();
    this.draggableGroup.destroy();
  }

  private onImageLoaded(layer: Layer, image: Image): void {
    const spacing = 0;

    let group = new Group({
      draggable: true,
      x: this.step,
      y: this.step,
    });

    const shape = new Rect({
      id: 'bottomQuadrantBackground',
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      globalCompositeOperation: 'multiply',
    });

    const spacer = new Group();

    const spacerContainer = new Rect({
      width: 200,
      height: 24,
      fill: 'pink',
    });
    const spacerTrigger = new Rect({
      x: spacerContainer.width() / 2 - 50 / 2,
      y: spacerContainer.height() / 2 - 4 / 2,
      width: 50,
      height: 4,
      fill: '#ff6699',
    });

    spacer.add(spacerContainer, spacerTrigger);

    let rightQuadrant = new Group({
      x: image.x() + image.width() + spacing,
      y: image.y(),
    });

    const _r = new Text({
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam harum quaerat facilis molestiae aut enim commodi necessitatibus magnam, asperiores quidem.',
      fontFamily: 'Lato',
      fontSize: 32,
      lineHeight: 1.25,
      width: 350,
    });

    // measure.fontBoundingBoxAscent = font.ascender * scale;
    // measure.fontBoundingBoxDescent = font.descender * scale;

    let rightQuadrantChildren: (Group | Shape<ShapeConfig>)[] = [_r];

    // spacer.clone(),

    // new Text({
    //   text: 'ITEM #680252',
    //   fontFamily: 'Arial',
    //   fontSize: 14,
    //   lineHeight: 1,
    // }),

    // new Text({
    //   text: '10.76 SQ. FT. PER BOX',
    //   fontFamily: 'Arial',
    //   fontSize: 14,
    //   lineHeight: 1,
    // }),

    // new Text({
    //   text: '$11.09/sq. ft.',
    //   fontFamily: 'Arial',
    //   fontSize: 24,
    //   fontStyle: 'bold',
    //   lineHeight: 1.25,
    // }),

    // new Text({
    //   text: 'Box Price: $119.38',
    //   fontFamily: 'Arial',
    //   fontSize: 18,
    //   lineHeight: 1.25,
    // }),
    let bottomQuadrantChildren: (Group | Shape<ShapeConfig>)[] = [
      // new Text({
      //   text: 'Crisp cut lines and chiseled edges add visual interest to the natural marble appearance of the Chester Silver Versailles porcelain tile by Fired Earth Ceramics. The popular multi-piece pattern utilizes a matte finish to enhance the softness of neutral taupe and grey coloring that distinguishes this wonderfully textured floor tile.',
      //   fontFamily: 'Arial',
      //   fontSize: 14,
      //   // lineHeight: 1.5,
      //   width: image.width(),
      // }),
    ];

    bottomQuadrantChildren = this.getAutoLayout(bottomQuadrantChildren);
    rightQuadrantChildren = this.getAutoLayout(rightQuadrantChildren);

    let bottomQuadrant = new Group({
      x: image.x(),
      y: image.y() + image.height() + spacing,
    });

    bottomQuadrant.on(
      KonvaNodeEvent.mouseover,
      (e: KonvaEventObject<MouseEvent>) => {
        const parent: Group = e.target.getParent();
        if (parent.find('#bottomQuadrantBackground').length) return;
        const { width, height } = e.target.getParent().getClientRect();
        const shape = new Rect({
          id: 'bottomQuadrantBackground',
          width,
          height,
          fill: 'rgba(255,50,0, 1)',
        });
        // shape.cache();
        shape.globalCompositeOperation('multiply');
        bottomQuadrant.add(shape);
        // shape.moveToBottom();
      }
    );

    bottomQuadrant.on(
      KonvaNodeEvent.mouseleave,
      (e: KonvaEventObject<MouseEvent>) => {
        const parent: Group = e.target.getParent();
        const [quadrant] = parent.find('#bottomQuadrantBackground');
        quadrant.destroy();
      }
    );

    bottomQuadrant.add(...bottomQuadrantChildren);
    rightQuadrant.add(...rightQuadrantChildren);

    // rightQuadrant.on('click', () => {

    // WebFont.load({
    //   google: {
    //     families: ['Montserrat']
    //   },
    //   active: function() {
    //   }
    // });
    let k = document.getElementById('editor');
    var quill = new Quill(k!);
    quill.insertText(
      0,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam harum quaerat facilis molestiae aut enim commodi necessitatibus magnam, asperiores quidem.',
      {}
    );

    // rightQuadrant.hide();
    // })

    group.add(image, rightQuadrant);
    group.add(shape);
    layer.add(group);
    group.on(KonvaNodeEvent.dragstart, () => this.onShapeDragStart(group));
    group.on(KonvaNodeEvent.dragmove, (e) => this.onShapeDragMove(group, e));
    group.on(KonvaNodeEvent.dragend, () => this.onShapeDragEnd(group));

    console.log();

    const unitsPerEm = 2000;
    const ascender = 1974;
    const descender = -426;
    const measure: TextMetrics = _r.getContext().measureText('Test');
    var fontSize = 24;
    var scale = (1 / unitsPerEm) * fontSize;
    console.log('Scale', scale);
    const fontBoundingBoxAscent = ascender * scale;
    const fontBoundingBoxDescent = descender * scale;
    console.log('Mearure', measure.actualBoundingBoxAscent, measure.fontBoundingBoxAscent, ascender)
    const lh = (1.25 * (32 + measure.fontBoundingBoxAscent) - (32 - measure.fontBoundingBoxDescent)) ;
    _r.setAttrs({
      'lineHeight': lh,
    })
    console.log('11', _r.getAttr('lineHeight'), lh)
    // group.on('dragend', (e) => {
    // group.position({
    //   x: Math.round(group.x() / this.step) * this.step,
    //   y: Math.round(group.y() / this.step) * this.step,
    // });
    // screenshotShape(e).then((image) => this.addItemToSidebar(image));
    // });
  }

  private createItemBox(layer: Layer): void {
    Image.fromURL(
      'https://s7d1.scene7.com/is/image/TileShop/680252?$PDPThumbnail$',
      (_image: Image) => {
        _image.setAttrs({
          x: 0,
          y: 0,
          width: 200,
          height: 200,
        });
        this.onImageLoaded(this.canvasLayer, _image);
      }
    );
  }

  private addItemToSidebar(image: string): void {
    this.images.push(image);
  }

  private getAutoLayout(
    array: (Group | Shape<ShapeConfig>)[]
  ): (Group | Shape<ShapeConfig>)[] {
    let _y = 0;
    let _spacer = 24;
    return array.map(
      (
        text: Group | Shape<ShapeConfig>,
        index: number,
        array: (Group | Shape<ShapeConfig>)[]
      ) => {
        text.y(_y);
        let _space = index === 0 ? 0 : _spacer;
        _y += text.getClientRect().height + _space;
        return text;
      }
    );
  }

  private setCursor(cursor: string = 'default'): void {
    this.stage.container().style.cursor = cursor;
  }

  private generateGrid(): void {
    for (let x = 1; x < this.stage.width() / this.step - 1; x++) {
      for (let y = 1; y < this.stage.height() / this.step - 1; y++) {
        const circle = new Circle({
          x: x * this.step,
          y: y * this.step,
          radius: 3,
          listening: false,
          perfectDrawEnabled: false,
          fill: 'rgba(0,0,0, 0.1)',
        });
        circle.cache();
        this.gridLayerGroup.add(circle);
      }
    }
    this.gridLayerGroup.cache();
    this.gridLayer.add(this.gridLayerGroup);
    this.stage.add(this.gridLayer);
    this.gridLayer.moveToBottom();
    this.gridLayer.cache();
  }

  private isNotFirstColumnAndRow(vector: Vector2d): boolean {
    const { x, y } = vector;
    return x !== 0 && y !== 0;
  }

  private handleScrollDirectionScaleChange(
    e: KonvaEventObject<WheelEvent>
  ): void {
    const _scale = this.stage.scale();
    const _step = 0.015;
    const { deltaY } = e.evt;
    if (deltaY < 0) {
      this.stage.scaleX(_scale?.x || 0 + _step);
      this.stage.scaleY(_scale?.y || 0 + _step);
    } else {
      this.stage.scaleX(_scale?.x || 0 - _step);
      this.stage.scaleY(_scale?.y || 0 - _step);
    }
  }

  public ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.draw();
    });
  }
}

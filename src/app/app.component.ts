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
import { Util } from 'konva/lib/Util';
import { KonvaEventObject, NodeConfig, Node } from 'konva/lib/Node';

import { Display, GridConfig, Vertices } from './interfaces';
import { handleClick, handleDragEnd, handleDragStart } from './drag';
import { handleWheel } from './zoom';
import { Shape } from 'konva/lib/Shape';
import { getShapesVertices } from './vertices';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { getTransformer } from './transformer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  constructor() {}

  private ngZone = inject(NgZone);

  private gridStep: number = 100;

  private group = new Group({
    draggable: true,
  });

  private vertices: Vertices = {
    vertical: new Set(),
    horizontal: new Set(),
  };

  private layer = new Layer({}).add(this.group);

  private dragLayerGroup = new Group();
  private dragLayer = new Layer().add(this.dragLayerGroup);

  private verticesLayerGroup = new Group();
  private verticesLayer = new Layer().add(this.verticesLayerGroup);

  private stage!: Stage;
  private display!: Display;

  private transformer: Transformer = new Transformer({
    name: 'Transformer',
    ...getTransformer(this.gridStep),
  });

  private initializeStage(config: { containerId: string }): void {
    this.ngZone.runOutsideAngular(() => {
      // const editor = new EditorJS({
      //   holder: 'editorjs',
      //   autofocus: true,
      //   placeholder: 'Let`s write an awesome story!',
      //   inlineToolbar: false,
      //   hideToolbar: true,
      //   readOnly: true,

      //   onChange: (api, event) => {
      //     console.log('Change', api, event);
      //     editor
      //       .save()
      //       .then((outputData) => {
      //         console.log('Article data: ', outputData);
      //       })
      //       .catch((error) => {
      //         console.log('Saving failed: ', error);
      //       });
      //   },
      //   onReady: () => {
      //     editor.render({
      //       blocks: [
      //         {
      //           type: 'header',
      //           data: {
      //             text: 'Why Telegram is the best messenger',
      //             level: 2,
      //           },
      //         },
      //       ],
      //     });
      //   },
      // });

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
      this.initializeGrid({
        stage: this.stage,
        layer: this.gridLayer,
        group: this.gridLayerGroup,
      });

      this.stage.add(this.layer);
      this.stage.add(this.dragLayer);

      this.stage.on('wheel', (e: KonvaEventObject<WheelEvent>) =>
        handleWheel({ e, stage: this.stage })
      );
      this.stage.on('click', (e: KonvaEventObject<MouseEvent>) => {
        if (this.transformer?.getNodes()?.length) {
          const [node] = this.transformer?.getNodes();
          console.log('Node', node.isClientRectOnScreen());
          if (e.target === e.target.getStage()) {
            if (
              !!this.transformer.getNodes().length &&
              node?.getType() === 'Shape'
            ) {
              console.log('Has Transformer On Page');
            } else {
              this.transformer.nodes([]);
            }
          }
        }
      });
      this.generateShapes({ quantity: 300, step: this.gridStep });
      this.layer.add(this.group);
      this.stage.add(this.verticesLayer);
      this.vertices.vertical
        .add(0)
        .add(this.display.w / 2)
        .add(this.display.w);
      this.vertices.horizontal
        .add(0)
        .add(this.display.h / 2)
        .add(this.display.h);
    });
  }

  private generateShapes(config: { quantity: number; step: number }): void {
    for (let index = 0; index < config.quantity; index++) {
      const shape: Rect = new Rect({
        name: 'Shape',
        id: `Shape-${index}`,
        x: Math.random() * 10 * 100,
        y: Math.random() * 10 * 100,
        width: config.step / 2,
        height: config.step / 2,
        // x: config.step,
        // y: config.step,
        fill: Util.getRandomColor(),
        draggable: true,
      });
      shape.on('click', (event: KonvaEventObject<MouseEvent>) => {
        handleClick({
          shape: event.target,
          group: this.group,
          step: config.step,
          transformer: this.transformer,
        });
      });
      shape.on('dragstart', (event: KonvaEventObject<MouseEvent>) => {
        let shapes: Node<NodeConfig>[] = this.stage
          .find('.Shape')
          .filter((shape) => shape.attrs.id !== event.target.attrs.id)
          .filter((shape) => shape.isClientRectOnScreen());

        const { vertical, horizontal } = getShapesVertices(shapes);

        [...horizontal].map((v) => this.vertices.horizontal.add(v));
        [...vertical].map((v) => this.vertices.vertical.add(v));

        handleDragStart({
          shape: event.target,
          dragLayerGroup: this.dragLayerGroup,
          gridLayerGroup: this.gridLayerGroup,
          stage: this.stage,
          display: this.display,
          vertices: this.vertices,
          verticesLayerGroup: this.verticesLayerGroup,
        });
      });
      shape.on('dragend', (event: KonvaEventObject<MouseEvent>) => {
        handleDragEnd({
          shape: event.target,
          step: config.step,
          group: this.group,
          vertices: this.vertices,
          verticesLayerGroup: this.verticesLayerGroup,
        });
      });
      this.group.add(shape);
    }
  }

  private gridLayer: Layer = new Layer({
    id: 'Grid Layer',
  });

  private gridLayerGroup: Group = new Group({
    id: 'Grid Lines',
  }).add(
    ...this.getVerticalLines(this.gridStep),
    ...this.getHorizontalLines(this.gridStep)
  );

  private initializeGrid(config: GridConfig): void {
    if (!config.stage && !config.layer) {
      config.group.destroyChildren();
      config.group.add(
        ...this.getVerticalLines(this.gridStep),
        ...this.getHorizontalLines(this.gridStep)
      );
    } else {
      const { stage, layer, group } = config;
      if (stage && layer && group) {
        stage?.add(layer?.add(group));
      }
    }
  }

  private getHorizontalLines(step: number): any[] {
    const lines: Line[] = [];
    const { innerHeight, innerWidth } = window;
    for (let index = 0; index <= Math.ceil(innerHeight / step); index++) {
      lines.push(
        new Line({
          name: 'Horizontal',
          points: [0, 0 + index * step, innerWidth, 0 + index * step],
          strokeWidth: 1,
          stroke: '#b9b9b9',
          dash: [8, 8],
        })
      );
      this.vertices.horizontal.add(0 + index * step);
    }
    return lines;
  }

  private getVerticalLines(step: number): any[] {
    const lines: Line[] = [];
    const { innerHeight, innerWidth } = window;
    for (let index = 0; index <= Math.ceil(innerWidth / step); index++) {
      lines.push(
        new Line({
          name: 'Vertical',
          points: [0 + index * step, 0, 0 + index * step, innerHeight],
          strokeWidth: 1,
          dash: [8, 8],
          stroke: '#b9b9b9',
        })
      );
      this.vertices.vertical.add(0 + index * step);
    }
    return lines;
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
    this.initializeGrid({
      group: this.gridLayerGroup,
    });
  }
}

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
import { Util } from 'konva/lib/Util';
import { KonvaNodeEvent } from 'konva/lib/types';
import { KonvaEventObject } from 'konva/lib/Node';

import { GridConfig } from './eff.interfaces';
import { handleDragEnd } from './drag';
import { getShapeScreenshot } from './getShapeScreenshot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  constructor() {}

  private ngZone = inject(NgZone);

  private gridStep: number = 40;

  private group = new Group({
    draggable: true,
  });

  private layer = new Layer({}).add(this.group);

  private dragLayerGroup = new Group();
  private dragLayer = new Layer().add(this.dragLayerGroup);

  private stage!: Stage;

  private initializeStage(config: { containerId: string }): void {
    this.ngZone.runOutsideAngular(() => {
      const { innerWidth, innerHeight } = window;
      this.stage = new Stage({
        id: 'Stage',
        container: config.containerId,
        width: innerWidth,
        height: innerHeight,
      });
      this.stage.add(this.layer);
      this.stage.add(this.dragLayer);

      for (let index = 0; index < 3; index++) {
        const shape: Rect = new Rect({
          name: 'shape',
          x: Math.random() * 10 * 93,
          y: Math.random() * 10 * 74,
          width: Math.random() * 15 * 80,
          height: Math.random() * 15 * 40,
          fill: Util.getRandomColor(),
          draggable: true,
        });
        shape.on(
          KonvaNodeEvent.dragstart,
          (event: KonvaEventObject<MouseEvent>) => event.target.moveToTop()
        );
        shape.on(
          KonvaNodeEvent.dragend,
          (event: KonvaEventObject<MouseEvent>) => {
            handleDragEnd({
              shape: event.target,
              step: this.gridStep,
            });
          }
        );
        this.group.add(shape);
        this.layer.add(this.group);
      }
    });
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
          name: 'Grid: Horizontal',
          points: [0, 0 + index * step, innerWidth, 0 + index * step],
          strokeWidth: 1,
          stroke: '#c9c9c9',
        })
      );
    }
    return lines;
  }

  private getVerticalLines(step: number): any[] {
    const lines: Line[] = [];
    const { innerHeight, innerWidth } = window;
    for (let index = 0; index <= Math.ceil(innerWidth / step); index++) {
      lines.push(
        new Line({
          name: 'Grid: Vertical',
          points: [0 + index * step, 0, 0 + index * step, innerHeight],
          strokeWidth: 1,
          stroke: '#c9c9c9',
        })
      );
    }
    return lines;
  }

  public ngAfterViewInit(): void {
    this.initializeStage({ containerId: 'container' });
    this.initializeGrid({
      stage: this.stage,
      layer: this.gridLayer,
      group: this.gridLayerGroup,
    });
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

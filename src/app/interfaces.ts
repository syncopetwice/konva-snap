import { Group } from 'konva/lib/Group';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';

export interface Display {
  w: number;
  h: number;
}

export interface GridConfig {
  stage?: Stage;
  layer?: Layer;
  group: Group;
}

export interface Vertices {
  vertical: Set<number>;
  horizontal: Set<number>;
}

export interface Snaps {
  before: number;
  prev: number;
  next: number;
  after: number;
}

export interface Distance {
  fromSnapToStart: number;
  fromStartToSnap: number;
  fromSnapToEnd: number;
  fromEndToSnap: number;
}

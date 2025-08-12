export interface DraggablePosition {
  x: number;
  y: number;
}

export interface DraggableBounds {
  width: number;
  height: number;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface DraggableEventHandlers {
  onDragStart?: (position: DraggablePosition) => void;
  onDrag?: (position: DraggablePosition) => void;
  onDragEnd?: (position: DraggablePosition) => void;
  onRotateStart?: (rotation: number) => void;
  onRotate?: (rotation: number) => void;
  onRotateEnd?: (rotation: number) => void;
}

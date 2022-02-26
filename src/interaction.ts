import { CanvasJpPoint } from "./Point";

export type CanvasJpEventHandler<K extends keyof HTMLElementEventMap> = {
  on: K;
  trigger: (event: HTMLElementEventMap[K]) => void;
};

export type CanvasJpEventHandlerList = CanvasJpEventHandler<
  keyof HTMLElementEventMap
>[];

export type CanvasJpClickRegion = {
  __type: "ClickRegion";
  points: CanvasJpPoint[];
  events: CanvasJpEventHandlerList;
};

export const ClickRegion = (
  points: CanvasJpPoint[],
  events: CanvasJpEventHandlerList
): CanvasJpClickRegion => {
  return {
    __type: "ClickRegion",
    points,
    events,
  };
};

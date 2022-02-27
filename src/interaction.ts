import { CanvasJpDrawable } from ".";
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

export type CanvasJpRenderOnlyWhenVisible = {
  __type: "RenderOnlyWhenVisible";
  points: CanvasJpPoint[];
  elements: CanvasJpDrawable[];
};

export const RenderOnlyWhenVisible = (
  points: CanvasJpPoint[],
  elements: CanvasJpDrawable[]
): CanvasJpRenderOnlyWhenVisible => {
  return {
    __type: "RenderOnlyWhenVisible",
    points,
    elements,
  };
};

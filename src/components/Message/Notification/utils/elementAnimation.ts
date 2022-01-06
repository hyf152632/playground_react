import { CSSProperties } from "react";

export type NotificationAnimationType = "slide" | "fade";
export type AnimationOrigin =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "rightTop"
  | "rightCenter"
  | "rightBottom"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight"
  | "leftTop"
  | "leftCenter"
  | "leftBottom";

export function getElementEnterStartCSSProperties(
  element: HTMLElement,
  position: AnimationOrigin,
  animationType: NotificationAnimationType,
  offsetViewport: number
): CSSProperties {
  if (animationType === "fade") {
    return { opacity: 0 };
  }

  const { top, height } = element.getBoundingClientRect();
  const slideAnimationStartMaps = new Map<AnimationOrigin[], CSSProperties>([
    [
      ["topLeft"],
      {
        transform: `translate3d(${offsetViewport}px, -${top + height}px, 0)`
      }
    ],
    [["topCenter"], { transform: `translateY(-${top + height}px)` }],
    [
      ["topRight"],
      {
        transform: `translate3d(calc(-100% - ${offsetViewport}px), -${
          top + height
        }px, 0)`
      }
    ],
    [["rightTop", "rightCenter", "rightBottom"], {}],
    [
      ["bottomLeft"],
      {
        transform: `translate3d(${offsetViewport}px, ${height}px, 0)`
      }
    ],
    [["bottomCenter"], { transform: `translateY(${height}px)` }],
    [
      ["bottomRight"],
      {
        transform: `translate3d(calc(-100% - ${offsetViewport}px), ${height}px, 0)`
      }
    ],
    [
      ["leftTop", "leftCenter", "leftBottom"],
      { transform: `translateX(calc(-100% - ${offsetViewport}px)` }
    ]
  ]);

  return (
    [...(slideAnimationStartMaps.entries() as any)].find(([k]) => {
      return (k as AnimationOrigin[]).includes(position);
    })?.[1] || {}
  );
}

export function getElementEnterEndCSSProperties(
  position: AnimationOrigin,
  animationType: NotificationAnimationType,
  offsetViewport: number
): CSSProperties {
  if (animationType === "fade") {
    return { opacity: 1 };
  }

  const slideAnimationEndMaps = new Map<AnimationOrigin[], CSSProperties>([
    [
      ["topLeft"],
      {
        transform: `translate3d(${offsetViewport}px, 0, 0)`
      }
    ],
    [["topCenter"], { transform: `translateY(0px)` }],
    [
      ["topRight"],
      {
        transform: `translate3d(calc(-100% - ${offsetViewport}px), 0, 0)`
      }
    ],
    [
      ["rightTop", "rightCenter", "rightBottom"],
      {
        transform: `translateX(calc(-100% - ${offsetViewport}px))`
      }
    ],
    [
      ["bottomLeft"],
      {
        transform: `translate3d(${offsetViewport}px, 0, 0)`
      }
    ],
    [["bottomCenter"], { transform: `translateY(0px)` }],
    [
      ["bottomRight"],
      {
        transform: `translate3d(calc(-100% - ${offsetViewport}px), 0, 0)`
      }
    ],
    [
      ["leftTop", "leftCenter", "leftBottom"],
      { transform: `translateX(${offsetViewport}px)` }
    ]
  ]);

  return (
    [...(slideAnimationEndMaps.entries() as any)].find(([k]) => {
      return (k as AnimationOrigin[]).includes(position);
    })?.[1] || {}
  );
}

export function getElementLeaveEndCSSProperties(
  element: HTMLElement,
  position: AnimationOrigin,
  animationType: NotificationAnimationType,
  offsetViewport: number
): CSSProperties {
  if (animationType === "fade") {
    return { opacity: 0 };
  }

  const { top, height } = element.getBoundingClientRect();

  const animationSlideEndMaps = new Map<AnimationOrigin[], CSSProperties>([
    [
      ["topLeft"],
      {
        transform: `translate3d(${offsetViewport}px, ${-(top + height)}px, 0)`
      }
    ],
    [["topCenter"], { transform: `translateY(${-(top + height)}px)` }],
    [
      ["topRight"],
      {
        transform: `translate3d(-${offsetViewport}px, ${-(top + height)}px, 0)`
      }
    ],
    [
      ["rightTop", "rightBottom", "rightCenter"],
      { transform: `translateX(calc(100% + ${offsetViewport}px))` }
    ],
    [
      ["bottomLeft"],
      {
        transform: `translate3d(${offsetViewport}px, ${
          window.innerHeight - top
        }px, 0)`
      }
    ],
    [
      ["bottomCenter"],
      { transform: `translateY(${window.innerHeight - top}px)` }
    ],
    [
      ["bottomRight"],
      {
        transform: `translate3d(calc(-100% - ${offsetViewport}px), ${
          window.innerHeight - top
        }px, 0)`
      }
    ],
    [
      ["leftTop", "leftCenter", "leftBottom"],
      { transform: `translateX(calc(-100% - ${offsetViewport}px))` }
    ]
  ]);

  return (
    [...(animationSlideEndMaps.entries() as any)].find(([k]) => {
      return (k as AnimationOrigin[]).includes(position);
    })?.[1] || {}
  );
}

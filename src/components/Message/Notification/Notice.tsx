import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
  CSSProperties
} from "react";
import { ReactComponent as CloseIcon } from "components/Message/assets/icons/close-circle-fill.svg";
import styles from "./index.module.css";
import {
  defaultPosition,
  defaultTransitionName,
  NotificationAnimationType,
  AnimationOrigin
} from "./index";

interface DivProps extends React.HTMLProps<HTMLDivElement> {
  // Ideally we would allow all data-* props but this would depend on https://github.com/microsoft/TypeScript/issues/28960
  "data-testid"?: string;
}

export interface NoticeProps {
  prefixCls?: string;
  style?: CSSProperties;
  className?: string;
  duration?: number | null;
  children?: React.ReactNode;
  /** Mark as final key since set maxCount may keep the key but user pass key is different */
  noticeKey: React.Key;
  key?: string | number;
  userKey?: string | number; // same as key, used when use manually remove a Notice
  closeIcon?: React.ReactNode;
  closable?: boolean;
  divProps?: DivProps;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onClose?: (key?: React.Key) => void;

  /** @private Only for internal usage. We don't promise that we will refactor this */
  holder?: HTMLDivElement;
  _rootPosition?: AnimationOrigin;
  _animationName?: NotificationAnimationType;
  isLastElement?: boolean;
  prevElementsAccumulatedTranfromProp: CSSProperties;
}

export interface NoticeContent
  extends Omit<
    NoticeProps,
    "prefixCls" | "children" | "noticeKey" | "onClose"
  > {
  prefixCls?: string;
  key?: React.Key;
  content?: React.ReactNode;
  onClose?: () => void;
}

function getHideNoticeAnimationEndState(element: HTMLDivElement | null) {
  if (!element) {
    return {};
  }
}

export interface NoticeImperativeHandles {
  close: () => void;
  userKey: string | number | undefined;
  getEleRect: () => DOMRect | undefined;
  getEleStyle: () => CSSStyleDeclaration | undefined;
  getAnimationRelativePropsInfo: () =>
    | { marginTop: number; marginBottom: number; height: number }
    | undefined;
  getEleOriginStyle: () => CSSProperties;
}

const Notice = (
  {
    userKey,
    children,
    style = {},
    className,
    duration = 0,
    onShouldUnmountNotice,
    noticeKey,
    onClick,
    closable = true,
    closeIcon,
    _rootPosition = defaultPosition,
    _animationName = defaultTransitionName,
    isLastElement,
    prevElementsAccumulatedTranfromProp
  }: NoticeProps & {
    onShouldUnmountNotice: (noticeKey: React.Key) => void;
  },
  ref: ForwardedRef<NoticeImperativeHandles>
) => {
  const noticeRef = useRef<HTMLDivElement>(null);
  const isMountRef = useRef(false);

  const handleUnmountAnimation = useCallback(
    (afterAnimationFinishedCb?: Function) => {
      if (!noticeRef.current) {
        return;
      }

      const { top, height } = noticeRef.current.getBoundingClientRect();

      const animationStart = {
        transform: `translateY(0px)`
      };
      const animationEnd = {
        transform: `translateY(${-(top + height)}px)`
      };

      var player = noticeRef.current?.animate([animationStart, animationEnd], {
        duration: 300,
        easing: "cubic-bezier(0,0,0.32,1)",
        fill: "forwards"
      });

      player?.addEventListener(
        "finish",
        () => afterAnimationFinishedCb && afterAnimationFinishedCb()
      );
    },
    [noticeRef]
  );

  const handleOnShouldUnmountNotice = useCallback(() => {
    if (onShouldUnmountNotice) {
      onShouldUnmountNotice(noticeKey);
    }
  }, [onShouldUnmountNotice, noticeKey]);

  useImperativeHandle(
    ref,
    () => ({
      close: () => {
        handleUnmountAnimation(handleOnShouldUnmountNotice);
      },
      userKey,
      getAnimationRelativePropsInfo: () => {
        if (!noticeRef.current) {
          return;
        }

        return {
          marginTop: parseInt(
            getComputedStyle(noticeRef.current).marginTop,
            10
          ),
          marginBottom: parseInt(
            getComputedStyle(noticeRef.current).marginBottom,
            10
          ),
          height: parseInt(getComputedStyle(noticeRef.current).height, 10)
        };
      },
      getEleRect: () => noticeRef.current?.getBoundingClientRect(),
      getEleStyle: () => noticeRef.current?.style,
      getEleOriginStyle: () => style
    }),
    [handleUnmountAnimation, handleOnShouldUnmountNotice, userKey, style]
  );

  // handle auto hide with animation before unmount;
  useEffect(() => {
    if (!duration) {
      return;
    }

    const timer = setTimeout(
      () => handleUnmountAnimation(handleOnShouldUnmountNotice),
      duration * 1000
    );

    return () => {
      clearTimeout(timer);
    };
  }, [duration, handleUnmountAnimation, handleOnShouldUnmountNotice]);

  const handleClose = useCallback(() => {
    if (!closable) {
      return;
    }
    handleUnmountAnimation(handleOnShouldUnmountNotice);
  }, [closable, handleUnmountAnimation, handleOnShouldUnmountNotice]);

  const computedAnimationStyle = useMemo(() => {
    // if(_animationName === '') {}
    let styleObj = {};
    if (
      _rootPosition === "topLeft" ||
      _rootPosition === "topCenter" ||
      _rootPosition === "topRight"
    ) {
      styleObj = {
        ...styleObj,
        top:
          (Number(
            prevElementsAccumulatedTranfromProp &&
              prevElementsAccumulatedTranfromProp.top
          ) || 0) +
          ((style && style.top && parseInt(style.top as any, 10)) || 0)
      };
    }
    return styleObj;
  }, [_rootPosition, style, prevElementsAccumulatedTranfromProp]);

  // animation when mount
  useLayoutEffect(() => {
    if (!isMountRef.current) {
      noticeRef.current?.animate(
        [{ transform: `translateY(-100px)` }, { transform: `translateY(0px)` }],
        {
          duration: 300,
          easing: "cubic-bezier(0,0,0.32,1)",
          fill: "forwards"
        }
      );
      isMountRef.current = true;
    }
  }, []);

  return (
    <div
      ref={noticeRef}
      className={`${styles.notice_wrapper} ${className}`}
      style={{ ...style, ...computedAnimationStyle }}
      onClick={onClick}
    >
      {children}
      {closable && (
        <section
          className={styles.notice_close_icon_wrapper}
          onClick={handleClose}
        >
          {closeIcon}
          {!closeIcon && <CloseIcon />}
        </section>
      )}
    </div>
  );
};

export default forwardRef(Notice);

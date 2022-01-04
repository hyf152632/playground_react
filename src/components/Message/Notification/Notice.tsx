import {
  CSSProperties,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
  useCallback
} from "react";
import { ReactComponent as CloseIcon } from "components/Message/assets/icons/close-circle.svg";
import styles from "./index.module.css";

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
}

const Notice = (
  {
    userKey,
    children,
    style,
    className,
    index,
    duration = 0,
    onShouldUnmountNotice,
    noticeKey,
    onClick,
    closable = true,
    closeIcon
  }: NoticeProps & {
    index: number;
    onShouldUnmountNotice: (noticeKey: React.Key) => void;
  },
  ref: ForwardedRef<NoticeImperativeHandles>
) => {
  const noticeRef = useRef<HTMLDivElement>(null);
  const isMountRef = useRef(true);

  const handleUnmountAnimation = useCallback(
    (afterAnimationFinishedCb?: Function) => {
      var player = noticeRef.current?.animate(
        [
          { transform: `translateY(0px)`, opacity: 1 },
          { transform: `translateY(${-(index * 65 + 100)}px)`, opacity: 0 }
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0,0,0.32,1)",
          fill: "forwards"
        }
      );

      player?.addEventListener(
        "finish",
        () => afterAnimationFinishedCb && afterAnimationFinishedCb()
      );
    },
    [noticeRef, index]
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
      userKey
    }),
    [handleUnmountAnimation, handleOnShouldUnmountNotice, userKey]
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

  useEffect(() => {
    if (index === 0 && isMountRef.current) {
      noticeRef.current?.animate(
        [{ transform: `translateY(-100px)` }, { transform: `translateY(0px)` }],
        {
          duration: 300,
          easing: "cubic-bezier(0,0,0.32,1)",
          fill: "forwards"
        }
      );

      isMountRef.current = false;
    }
  }, [index]);

  const handleClose = useCallback(() => {
    if (!closable) {
      return;
    }
    handleUnmountAnimation(handleOnShouldUnmountNotice);
  }, [closable, handleUnmountAnimation, handleOnShouldUnmountNotice]);

  return (
    <div
      ref={noticeRef}
      className={`${styles.notice_wrapper} ${className}`}
      style={{ ...style, top: `${(index + 1) * 65}px` }}
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

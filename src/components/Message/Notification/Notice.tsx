import { CSSProperties, useRef, useEffect } from "react";
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

const Notice = ({
  children,
  style,
  className,
  index,
  duration = 0,
  onShouldUnmountNotice,
  noticeKey,
  onClick
}: NoticeProps & {
  index: number;
  onShouldUnmountNotice: (noticeKey: React.Key) => void;
}) => {
  const noticeRef = useRef<HTMLDivElement>(null);
  const isMountRef = useRef(true);

  // handle hide animation before unmount;
  useEffect(() => {
    if (!duration) {
      return;
    }

    const timer = setTimeout(() => {
      const animationEndState = getHideNoticeAnimationEndState(
        noticeRef.current
      );

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

      player?.addEventListener("finish", () => {
        if (onShouldUnmountNotice) {
          onShouldUnmountNotice(noticeKey);
        }
      });
    }, duration * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [noticeKey, duration, onShouldUnmountNotice, index]);

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

  return (
    <div
      ref={noticeRef}
      className={`${styles.notice_wrapper} ${className}`}
      style={{ ...style, top: `${(index + 1) * 65}px` }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Notice;

import {
  useState,
  // useRef,
  useImperativeHandle,
  useEffect,
  forwardRef,
  useCallback,
  CSSProperties
} from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Notice, { NoticeProps } from "./Notice";
// import styles from "./index.module.css";

export interface NotificationProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  transitionName?: string;
  animation?: string | object;
  maxCount?: number;
  closeIcon?: React.ReactNode;
}

let seed = 0;
const now = Date.now();

function getUuid() {
  const id = seed;
  seed += 1;
  return `rcNotification_${now}_${id}`;
}

const Notification = forwardRef(({}: NotificationProps, ref) => {
  const [notices, setNotices] = useState<NoticeProps[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      add: (notice: NoticeProps) => {
        const noticeKey = notice.noticeKey || getUuid();

        setNotices((prevNotices) => {
          const newNotices = [
            {
              ...notice,
              noticeKey,
              style: { ...(notice.style || {}), top: "65px" },
              visible: true
            },
            ...prevNotices
          ];
          return newNotices.map((noticeEach, index) => ({
            ...noticeEach,
            index
          }));
        });
      },
      remove: (key: string) => {
        setNotices((prevNotices) => {
          return prevNotices.filter((msg) => msg.noticeKey !== key);
        });
      }
    }),
    []
  );

  useEffect(() => {
    console.log(notices, "----------- notices ------------");
  }, [notices]);

  const onUnmountNotice = useCallback((noticeKey) => {
    setNotices((prevNotices) => {
      return prevNotices
        .filter((notice) => notice.noticeKey !== noticeKey)
        .map((notice, index) => ({ ...notice, index }));
    });
  }, []);

  return (
    <>
      {notices.map((notice, index) => (
        <Notice
          onShouldUnmountNotice={onUnmountNotice}
          key={notice.noticeKey}
          {...notice}
          index={index}
        />
      ))}
    </>
  );
});

const notificationCreator = () => (callback: any) => {
  let notificationRoot = document.querySelector("#notification_root");
  if (!notificationRoot) {
    const div = document.createElement("div");
    div.id = "notification_root";
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "50%";
    div.style.display = "relative";
    document.body.appendChild(div);
    notificationRoot = div;
  }

  render(
    <Notification
      ref={(ref: any) => {
        if (!ref) {
          return;
        }
        const handles = {
          notice(noticeProps: NoticeProps) {
            ref.add(noticeProps);
          },
          removeNotice(key: string) {
            ref.remove(key);
          },
          component: notificationRoot,
          destroy() {
            unmountComponentAtNode(notificationRoot!);
            if (notificationRoot?.parentNode) {
              notificationRoot.parentNode.removeChild(notificationRoot!);
            }
          }
        };
        callback(handles);
      }}
    />,
    notificationRoot
  );
};

export default notificationCreator();

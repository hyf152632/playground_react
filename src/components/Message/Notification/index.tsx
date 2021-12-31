import {
  useState,
  // useRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  forwardRef,
  useCallback,
  CSSProperties
} from "react";
import { render } from "react-dom";
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

const defaultMaxCount = 10000;

const Notification = forwardRef(
  ({ maxCount = defaultMaxCount }: NotificationProps, ref) => {
    const [notices, setNotices] = useState<NoticeProps[]>([]);
    // get same config from ref imperative handle
    const [notificationPropsFromRef, setNotificationPropsFromRef] = useState<
      NotificationProps
    >({});

    const integratedProps = useMemo(
      () => ({ maxCount, ...notificationPropsFromRef }),
      [maxCount, notificationPropsFromRef]
    );

    useImperativeHandle(
      ref,
      () => ({
        add: (notice: NoticeProps) => {
          setNotices((prevNotices) => {
            const isCurrentNoticeHasSameKeyWithBeforeSomeone = prevNotices.some(
              ({ key }) => key === notice.key
            );
            if (isCurrentNoticeHasSameKeyWithBeforeSomeone) {
              return prevNotices.map((prevNotice) => {
                if (prevNotice.key === notice.key) {
                  return { ...notice, noticeKey: prevNotice.noticeKey };
                }
                return prevNotice;
              });
            }
            const noticeKey = notice.noticeKey || getUuid();
            const newNotices = [
              {
                ...notice,
                noticeKey,
                style: { ...(notice.style || {}), top: "65px" }
              },
              ...prevNotices
            ].slice(0, integratedProps.maxCount);
            return newNotices.map((noticeEach, index) => ({
              ...noticeEach,
              index
            }));
          });
        },
        remove: (key?: string | number) => {
          if (typeof key !== "string" && typeof key !== "number") {
            setNotices([]);
            return;
          }
          setNotices((prevNotices) => {
            return prevNotices.filter((msg) => msg.key !== key);
          });
        },
        config: (options: NotificationProps) => {
          setNotificationPropsFromRef((prev) => ({ ...prev, ...options }));
        }
      }),
      [integratedProps]
    );

    useEffect(() => {
      console.log(notices, "----------- notices ------------");
    }, [notices]);

    const onUnmountNotice = useCallback((noticeKey) => {
      setNotices((prevNotices) => {
        const currentNotice = prevNotices.find(
          (notice) => notice.noticeKey === noticeKey
        );

        if (currentNotice && currentNotice.onClose) {
          currentNotice.onClose();
        }

        return prevNotices
          .filter((notice) => notice.noticeKey !== noticeKey)
          .map((notice, index) => ({ ...notice, index }));
      });
    }, []);

    // those props will be override by Notice props's same prop.
    const {
      className: classNameFromProps,
      style: styleFromProps = {},
      prefixCls: prefixClsFromProps
    } = integratedProps;

    return (
      <>
        {notices.map((notice, index) => {
          const {
            prefixCls,
            style = {},
            className,
            duration,
            children,
            noticeKey,
            closeIcon,
            closable,
            divProps,
            onClick,
            onClose
          } = notice;

          return (
            <Notice
              onShouldUnmountNotice={onUnmountNotice}
              className={className || classNameFromProps}
              style={{ ...styleFromProps, ...style }}
              prefixCls={prefixCls || prefixClsFromProps}
              duration={duration}
              children={children}
              noticeKey={noticeKey}
              closeIcon={closeIcon}
              closable={closable}
              divProps={divProps}
              onClick={onClick}
              onClose={onClose}
              key={notice.noticeKey}
              index={index}
            />
          );
        })}
      </>
    );
  }
);

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
          destroy(key: string | number) {
            ref.remove(key);
            // unmountComponentAtNode(notificationRoot!);
            // if (notificationRoot?.parentNode) {
            //   notificationRoot.parentNode.removeChild(notificationRoot!);
            // }
          },
          setConfig(options: NotificationProps) {
            ref.config(options);
          }
        };
        callback(handles);
      }}
    />,
    notificationRoot
  );
};

export default notificationCreator();

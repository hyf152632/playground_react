import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  CSSProperties
} from "react";
import { render } from "react-dom";
import Notice, { NoticeProps, NoticeImperativeHandles } from "./Notice";
import {
  NotificationAnimationType,
  AnimationOrigin
} from "./utils/elementAnimation";
// import styles from "./index.module.css";

export interface NotificationProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  transitionName?: NotificationAnimationType;
  position?: AnimationOrigin;
  maxCount?: number;
  closeIcon?: React.ReactNode;
}

export type NotificationRootProps = Partial<
  Pick<NotificationProps, "transitionName" | "position" | "className">
> & {
  rootElementId: string;
};

let seed = 0;
const now = Date.now();

function getUuid() {
  const id = seed;
  seed += 1;
  return `rcNotification_${now}_${id}`;
}

const default_zIndex = 1000;

function getCurrentIndex() {
  let step = 1;
  const zIndexComm = getComputedStyle(
    document.documentElement,
    ":root"
  ).getPropertyValue("--z-index-1000");

  return (Number(zIndexComm) || default_zIndex) + seed * step;
}

const defaultMaxCount = 10000;
export const defaultPosition = "topCenter";
export const defaultTransitionName = "slide";

const Notification = forwardRef((props: NotificationProps, ref) => {
  const [notices, setNotices] = useState<NoticeProps[]>([]!);
  // get same config from ref imperative handle
  const notificationPropsFromRef = useRef<NotificationProps>({});

  const noticeInstancesRef = useRef<NoticeImperativeHandles[]>([]);

  const getPrevElementsAccuTransfromProps = useCallback(
    (prevUserKeys: string[], initialVal: any) => {
      let noticeInstancesAnimationInfo = noticeInstancesRef.current.reduce<{
        [key: string]: {
          animationRelativeProps: { [key: string]: any };
          style: CSSProperties;
        };
      }>((acc, curr: NoticeImperativeHandles) => {
        if (curr) {
          return {
            ...acc,
            [String(curr.userKey)]: {
              style: (curr as any).getEleOriginStyle(),
              animationRelativeProps: (curr as any).getAnimationRelativePropsInfo()
            }
          };
        }
        return acc;
      }, {});

      // get accumulated props by all prevElements relatived props.
      return prevUserKeys.reduce((acc, curr) => {
        const currentEleInfo = noticeInstancesAnimationInfo[curr];

        if (currentEleInfo) {
          const {
            style: { top },
            animationRelativeProps: { marginTop, marginBottom, height }
          } = currentEleInfo;

          return (
            acc +
            (typeof top === "number" ? top * 2 : 0) +
            marginTop +
            height +
            marginBottom
          );
        }
        return acc;
      }, initialVal);
    },
    []
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
          const injectedDefaultZIndex = getCurrentIndex();
          const userKey = notice.key || noticeKey;

          const {
            position,
            transitionName,
            style,
            maxCount = defaultMaxCount
          } = {
            ...props,
            ...notificationPropsFromRef.current
          };

          const newNotices = [
            ...prevNotices.slice(-(maxCount - 1)),
            {
              ...notice,
              noticeKey,
              userKey,
              style: {
                zIndex: injectedDefaultZIndex,
                ...(notice.style || {}),
                ...style
              },
              _rootPosition: position,
              _animationName: transitionName
            }
          ];

          return newNotices.reduce<NoticeProps[]>((acc, currNotice, index) => {
            const prevElementsAccuTransfromProps = getPrevElementsAccuTransfromProps(
              newNotices
                .slice(0, index)
                .map((ni) => String(ni.userKey || ni.noticeKey)),
              0
            );

            return [
              ...acc,
              {
                ...currNotice,
                prevElementsAccumulatedTranfromProp: {
                  top: prevElementsAccuTransfromProps
                }
              }
            ];
          }, []);
        });
      },
      // remove by call notice instance's close method to fire animation
      // close method will call onShouldUnmountNotice prop
      // in onShouldUnmountNotice handle to remove notice state.
      remove: (key?: string | number) => {
        const isNoKeyProvide =
          typeof key !== "string" && typeof key !== "number";
        // should clear all
        if (isNoKeyProvide) {
          noticeInstancesRef.current.forEach((ni) => {
            if (ni) {
              ni.close();
            }
          });
          return;
        }

        const currentInstance = noticeInstancesRef.current.find(
          (ni) => ni.userKey === key
        );

        if (currentInstance) {
          currentInstance.close();
        }
      },
      config: (options: NotificationProps) => {
        notificationPropsFromRef.current = {
          ...notificationPropsFromRef.current,
          ...options
        };
      }
    }),
    [props, getPrevElementsAccuTransfromProps]
  );

  const onUnmountNotice = useCallback(
    (noticeKey) => {
      setNotices((prevNotices) => {
        const currentNotice = prevNotices.find(
          (notice) => notice.noticeKey === noticeKey
        );

        if (currentNotice && currentNotice.onClose) {
          currentNotice.onClose();
        }

        noticeInstancesRef.current = noticeInstancesRef.current.filter(
          (ni) =>
            !(
              ni.userKey === currentNotice?.noticeKey ||
              ni.userKey === currentNotice?.userKey
            )
        );

        // const currentNotices = prevNotices.filter((notice) => notice.noticeKey !== noticeKey)

        return prevNotices
          .filter((notice) => notice.noticeKey !== noticeKey)
          .map((notice, index, arr) => {
            const prevElementsAccuTransfromProps = getPrevElementsAccuTransfromProps(
              arr
                .slice(0, index)
                .map((ni) => String(ni.userKey || ni.noticeKey)),
              0
            );
            return {
              ...notice,
              prevElementsAccumulatedTranfromProp: {
                top: prevElementsAccuTransfromProps
              }
            };
          });
      });
    },
    [getPrevElementsAccuTransfromProps]
  );

  // those props will be override by Notice props's same prop.
  const {
    className: classNameFromProps,
    style: styleFromProps = {},
    prefixCls: prefixClsFromProps
  } = { ...props, ...notificationPropsFromRef.current };

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
          userKey,
          closeIcon,
          closable,
          divProps,
          onClick,
          onClose,
          _rootPosition,
          _animationName,
          prevElementsAccumulatedTranfromProp
        } = notice;

        return (
          <Notice
            ref={(noticeRef) => {
              if (noticeRef) {
                const cachedNoticeInstances = noticeInstancesRef.current;
                const isCurrentInstancesHasBeenCached = cachedNoticeInstances.find(
                  (ninstance) => ninstance?.userKey === noticeRef?.userKey
                );
                if (!isCurrentInstancesHasBeenCached) {
                  noticeInstancesRef.current = [
                    ...noticeInstancesRef.current,
                    noticeRef
                  ];
                }
              }
            }}
            onShouldUnmountNotice={onUnmountNotice}
            className={`${classNameFromProps} ${className}`}
            style={{ ...styleFromProps, ...style }}
            prefixCls={prefixCls || prefixClsFromProps}
            duration={duration}
            children={children}
            noticeKey={noticeKey}
            userKey={userKey}
            closeIcon={closeIcon}
            closable={closable}
            divProps={divProps}
            onClick={onClick}
            onClose={onClose}
            key={notice.noticeKey}
            _rootPosition={_rootPosition}
            _animationName={_animationName}
            prevElementsAccumulatedTranfromProp={
              prevElementsAccumulatedTranfromProp
            }
          />
        );
      })}
    </>
  );
});

const genRootElementId = (id: string) => {
  return `notification_root__${id}`;
};

const genNotificationRoot = (id: string, position: AnimationOrigin) => {
  let notificationRoot = document.querySelector(`#${id}`);
  if (notificationRoot) {
    return notificationRoot;
  }

  const div = document.createElement("div");
  div.id = id;
  div.style.position = "fixed";
  div.style.display = "relative";
  document.body.appendChild(div);

  const positionCondsMap = new Map<AnimationOrigin[], () => void>([
    [
      ["topLeft", "leftTop"],
      () => {
        div.style.top = "0";
        div.style.left = "0";
      }
    ],
    [
      ["topCenter"],
      () => {
        div.style.top = "0";
        div.style.left = "50%";
      }
    ],
    [
      ["topRight", "rightTop"],
      () => {
        div.style.top = "0";
        div.style.right = "0";
      }
    ],
    [
      ["rightCenter"],
      () => {
        div.style.right = "0";
        div.style.top = "50%";
      }
    ],
    [
      ["rightBottom", "bottomRight"],
      () => {
        div.style.right = "0";
        div.style.bottom = "0";
      }
    ],
    [
      ["bottomCenter"],
      () => {
        div.style.bottom = "0";
        div.style.left = "50%";
      }
    ],
    [
      ["bottomLeft", "leftBottom"],
      () => {
        div.style.bottom = "0";
        div.style.left = "0";
      }
    ],
    [
      ["leftCenter"],
      () => {
        div.style.left = "0";
        div.style.top = "50%";
      }
    ]
  ]);

  const positionFn = [...(positionCondsMap.entries() as any)].find(([k]) => {
    return (k as AnimationOrigin[]).includes(position);
  })?.[1];

  if (positionFn) {
    positionFn();
  }

  return div;
};

const notificationCreator = () => (
  callback: any,
  {
    position = "topCenter",
    transitionName = "slide",
    rootElementId,
    className
  }: NotificationRootProps
) => {
  const notificationRoot = genNotificationRoot(
    genRootElementId(rootElementId),
    position
  );

  render(
    <Notification
      transitionName={transitionName}
      position={position}
      className={className}
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

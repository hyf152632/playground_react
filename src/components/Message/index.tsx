import { CSSProperties, ReactNode } from "react";
import notificationCreator, { NotificationProps } from "./Notification/index";
import { ReactComponent as SuccessIcon } from "./assets/icons/check-circle-fill.svg";
import { ReactComponent as ErrorIcon } from "./assets/icons/close-circle-fill.svg";
import { ReactComponent as InfoIcon } from "./assets/icons/info-circle-fill.svg";
import { ReactComponent as LoadingIcon } from "components/Message/assets/icons/loading.svg";
import Config from "components/config";
import useMessage from "./useMessage";
import styles from "./index.module.css";

const {
  colors: { success, error, warning, link }
} = Config;

export enum MessageType {
  success = "success",
  error = "error",
  info = "info",
  warning = "warning",
  warn = "warn",
  loading = "laoding"
}

export interface Message {
  className?: string;
  content: ReactNode;
  /* 单位： s, 默认 3s, 设为 0 则不自动关闭 */
  duration?: number;
  icon?: ReactNode; // 自定义图标
  key?: string | number; // 当前提示的唯一标志
  style?: CSSProperties;
  onClick?: () => void;
  onClose?: () => void;
}

export interface MessageConfig {
  duration?: number; // 默认自动关闭延时，单位秒, 默认	3 s
  getContainer?: () => HTMLElement; // 配置渲染节点的输出位置	() => HTMLElement	() => document.body
  maxCount?: number; // 最大显示数, 超过限制时，最早的消息会被自动关闭
  prefixCls?: string; // 消息节点的 className 前缀	默认 ant-message
  rtl?: boolean; // 是否开启 RTL 模式	boolean	false
  top?: number; // 消息距离顶部的位置	默认 8
}

type MessageHandleFn = (
  contentOrConfig: ReactNode | Message,
  duration?: any,
  onClose?: (() => void) | undefined
) => (() => void) | Promise<boolean>;

export interface MessageHandlers {
  open: MessageHandleFn;
  success: MessageHandleFn;
  error: MessageHandleFn;
  info: MessageHandleFn;
  warning: MessageHandleFn;
  warn: MessageHandleFn;
  loading: MessageHandleFn;
  config: (config: MessageConfig) => void;
  destroy: (key?: string | number) => void;
}

let seed = 0;
const now = Date.now();

function getDefalutKey() {
  const id = seed;
  seed += 1;
  return `rcMessage_${now}_${id}`;
}

function isMessageConfig(input: Message | ReactNode): input is Message {
  if (input && (input as Message).content) {
    return true;
  }
  return false;
}

// This global config can be changed by message.config use updateMessageGlobalConfig()
const MESSAGE_GLOBAL_CONFIG: { [key: string]: any } = {
  duration: 3,
  style: {
    top: 8
  }
};

const extractKeyFromObj = (
  obj: { [key: string]: any },
  keys: string[]
): { [key: string]: any } => {
  return Object.keys(obj).reduce((prev, key) => {
    if (keys.includes(key)) {
      return { ...prev, [key]: obj[key] };
    }
    return prev;
  }, {} as { [key: string]: any });
};

const updateMessageGlobalConfig = (config: MessageConfig) =>
  Object.assign(
    MESSAGE_GLOBAL_CONFIG,
    extractKeyFromObj(config, Object.keys(MESSAGE_GLOBAL_CONFIG))
  );

const notificationPropsAdaptorByConfig = (
  config: MessageConfig,
  keys: string[]
): NotificationProps => {
  const obj = extractKeyFromObj(config, keys);
  const hasTopInConfig = "top" in config;
  if (hasTopInConfig) {
    return { ...obj, style: { top: config.top } };
  }
  return obj;
};

function message() {
  let notificationRef: any;
  notificationCreator((notification: any) => (notificationRef = notification), {
    rootElementId: "rc_message_root",
    className: styles.wrapper,
    transitionName: "fade",
    position: "topCenter"
  });

  function genWrappedChildenByType(
    type: MessageType | null,
    content: ReactNode,
    icon?: ReactNode
  ) {
    const WrappedContent = (TypeIcon?: ReactNode) => {
      return (
        <section className={styles.content_wrapper}>
          <div className={styles.content_icon_wrapper}>
            {icon !== null && (icon || TypeIcon)}
          </div>
          <div className={styles.content_content_wrapper}>{content}</div>
        </section>
      );
    };

    const typeMaps = {
      [MessageType.success]: () =>
        WrappedContent(<SuccessIcon color={success} />),
      [MessageType.error]: () => WrappedContent(<ErrorIcon color={error} />),
      [MessageType.info]: () => WrappedContent(<InfoIcon color={link} />),
      [MessageType.warning]: () => WrappedContent(<InfoIcon color={warning} />),
      [MessageType.warn]: () => WrappedContent(<InfoIcon color={warning} />),
      [MessageType.loading]: () =>
        WrappedContent(<LoadingIcon className="icon rotate" color={link} />)
    };

    if (type) {
      const currentType = typeMaps[type] as () => ReactNode;
      return (currentType && currentType()) || content;
    }

    return WrappedContent();
  }

  const typeFn = (notificationRef: any, type: MessageType | null) => (
    contentOrConfig: ReactNode | Message,
    duration = MESSAGE_GLOBAL_CONFIG.duration,
    onClose?: () => void
  ) => {
    // returned remove handle request a uniq key
    let key: number | string;
    if (!isMessageConfig(contentOrConfig)) {
      key = getDefalutKey();
    } else {
      const hasConfigHasKey =
        typeof contentOrConfig.key === "number" ||
        typeof contentOrConfig.key === "string";

      if (!hasConfigHasKey) {
        key = getDefalutKey();
      } else {
        key = contentOrConfig.key as string | number;
      }
    }

    let isSettled = false;

    const wrappedOnClose = () => {
      if (!isMessageConfig(contentOrConfig)) {
        if (onClose) {
          onClose();
        }
      } else {
        if (contentOrConfig.onClose) {
          contentOrConfig.onClose();
        }
      }
      isSettled = true;
    };

    if (isMessageConfig(contentOrConfig)) {
      const {
        content,
        icon,
        duration = MESSAGE_GLOBAL_CONFIG.duration
      } = contentOrConfig;

      notificationRef.notice({
        key,
        ...MESSAGE_GLOBAL_CONFIG,
        duration,
        ...contentOrConfig,
        style: {
          ...(MESSAGE_GLOBAL_CONFIG.style || {}),
          ...(contentOrConfig.style || {})
        },
        onClose: wrappedOnClose,
        children: genWrappedChildenByType(type, content, icon)
      });
    } else {
      notificationRef.notice({
        key,
        ...MESSAGE_GLOBAL_CONFIG,
        duration,
        onClose: wrappedOnClose,
        children: genWrappedChildenByType(type, contentOrConfig)
      });
    }

    const isDuration0 =
      duration === 0 ||
      (isMessageConfig(contentOrConfig) && contentOrConfig.duration === 0);
    // if the message not auto close, return close handle.
    if (isDuration0 || (!isDuration0 && MESSAGE_GLOBAL_CONFIG.duration === 0)) {
      return () => {
        notificationRef.destroy(key);
      };
    }

    let requestAnimationFrameHandler: number;

    return new Promise<boolean>((resolve) => {
      const queryIsSettled = () => {
        if (isSettled) {
          resolve(true);
          window.cancelAnimationFrame(requestAnimationFrameHandler);
          return;
        } else {
          requestAnimationFrameHandler = window.requestAnimationFrame(
            queryIsSettled
          );
        }
      };

      requestAnimationFrameHandler = window.requestAnimationFrame(
        queryIsSettled
      );
    });
  };

  const handlers: MessageHandlers = {
    open: typeFn(notificationRef, null),
    success: typeFn(notificationRef, MessageType.success),
    error: typeFn(notificationRef, MessageType.error),
    info: typeFn(notificationRef, MessageType.info),
    warning: typeFn(notificationRef, MessageType.warning),
    warn: typeFn(notificationRef, MessageType.warn),
    loading: typeFn(notificationRef, MessageType.loading),
    config: (config: MessageConfig) => {
      // 这里的配置项会分为两层抽象：
      // 一层是在当前层 Message:
      // - duration;
      // 另一层是在下一层的 Notification;
      // - maxCount;
      // - prefixCls;
      // - top;

      updateMessageGlobalConfig(config);

      notificationRef.setConfig(
        notificationPropsAdaptorByConfig(config, ["maxCount", "prefixCls"])
      );
    },
    destroy: (key?: string | number) => {
      notificationRef.destroy(key);
    }
  };

  return {
    useMessage: () => useMessage(handlers),
    ...handlers
  };
}

export default message();

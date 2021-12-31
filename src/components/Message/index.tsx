import { CSSProperties, ReactNode } from "react";
import notificationCreator, { NotificationProps } from "./Notification/index";
import { ReactComponent as SuccessIcon } from "./assets/icons/check-circle-fill.svg";
import { ReactComponent as ErrorIcon } from "./assets/icons/close-circle-fill.svg";
import { ReactComponent as InfoIcon } from "./assets/icons/info-circle-fill.svg";
import { ReactComponent as LoadingIcon } from "components/Message/assets/icons/loading.svg";
import Config from "components/config";
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
  duration: 3
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
  notificationCreator((notification: any) => (notificationRef = notification));

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

  const typeFn = (notificationRef: any, type: MessageType) => (
    contentOrConfig: ReactNode | Message,
    duration = MESSAGE_GLOBAL_CONFIG.duration,
    onClose?: () => void,
    key?: number | string
  ) => {
    if (isMessageConfig(contentOrConfig)) {
      const {
        content,
        icon,
        duration = MESSAGE_GLOBAL_CONFIG.duration
      } = contentOrConfig;

      console.log(MESSAGE_GLOBAL_CONFIG, "------------");

      notificationRef.notice({
        key,
        ...MESSAGE_GLOBAL_CONFIG,
        duration,
        ...contentOrConfig,
        children: genWrappedChildenByType(type, content, icon)
      });
    } else {
      notificationRef.notice({
        key,
        ...MESSAGE_GLOBAL_CONFIG,
        duration,
        onClose,
        children: genWrappedChildenByType(MessageType.success, contentOrConfig)
      });
    }
  };

  return {
    open: ({ content, icon, ...restMsg }: Message) => {
      console.log(MESSAGE_GLOBAL_CONFIG, "------------");
      notificationRef.notice({
        ...MESSAGE_GLOBAL_CONFIG,
        ...restMsg,
        children: genWrappedChildenByType(null, content || "", icon)
      });
    },
    // success: ({ content, icon, ...restMsg }: Message) => {
    success: typeFn(notificationRef, MessageType.success),
    error: typeFn(notificationRef, MessageType.error),
    info: typeFn(notificationRef, MessageType.info),
    warning: typeFn(notificationRef, MessageType.warning),
    warn: typeFn(notificationRef, MessageType.warn),
    loading: (
      contentOrConfig: ReactNode | Message,
      duration = MESSAGE_GLOBAL_CONFIG.duration,
      onClose?: () => void
    ) => {
      // loading method can be removed ( by key ) by return handle;
      // so, it must has a uniq key
      let key: number | string;
      if (!isMessageConfig(contentOrConfig)) {
        key = getDefalutKey();
      } else {
        const hasConfigHasKey =
          contentOrConfig.key &&
          (typeof contentOrConfig.key === "number" ||
            typeof contentOrConfig.key === "string");

        if (!hasConfigHasKey) {
          key = getDefalutKey();
        } else {
          key = contentOrConfig.key as any;
        }
      }

      typeFn(notificationRef, MessageType.loading)(
        contentOrConfig,
        duration,
        onClose,
        key
      );
      return () => {
        notificationRef.destroy(key);
      };
    },
    // TODO: global config
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

    // TODO: global destory
    destroy: (key?: string | number) => {
      notificationRef.destroy(key);
    }
  };
}

export default message();

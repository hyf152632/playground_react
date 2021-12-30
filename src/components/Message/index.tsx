import { CSSProperties, ReactNode } from "react";
import notificationCreator from "./Notification/index";
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

// 默认显示时长: 3s
const defaultDuration = 3;

function isMessageConfig(input: Message | ReactNode): input is Message {
  if (input && (input as Message).content) {
    return true;
  }
  return false;
}

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
    duration = defaultDuration,
    onClose?: () => void
  ) => {
    if (isMessageConfig(contentOrConfig)) {
      const { content, icon, duration = defaultDuration } = contentOrConfig;
      notificationRef.notice({
        duration,
        ...contentOrConfig,
        children: genWrappedChildenByType(type, content, icon)
      });
    } else {
      notificationRef.notice({
        duration,
        onClose,
        children: genWrappedChildenByType(MessageType.success, contentOrConfig)
      });
    }
  };

  return {
    open: ({ content, icon, ...restMsg }: Message) => {
      notificationRef.notice({
        duration: defaultDuration,
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
      duration = defaultDuration,
      onClose?: () => void
    ) => {
      typeFn(notificationRef, MessageType.loading)(
        contentOrConfig,
        duration,
        onClose
      );
      return () => {
        notificationRef.destroy();
      };
    },
    // TODO: global config
    config: () => {},
    // TODO: global destory
    destroy: (key?: string | number) => {
      notificationRef.destroy(key);
    }
  };
}

export default message();

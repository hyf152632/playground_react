import { CSSProperties, ReactNode } from "react";
import notificationCreator from "./Notification/index";
import { ReactComponent as SuccessIcon } from "./assets/icons/check-circle-fill.svg";
import { ReactComponent as ErrorIcon } from "./assets/icons/close-circle-fill.svg";
import { ReactComponent as InfoIcon } from "./assets/icons/info-circle-fill.svg";
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
  content?: ReactNode;
  /* 单位： s, 默认 3s, 设为 0 则不自动关闭 */
  duration?: number;
  icon?: ReactNode; // 自定义图标
  key?: string | number; // 当前提示的唯一标志
  style?: CSSProperties;
  onClick?: () => void;
  onClose?: () => void;
}

function message() {
  let notificationRef: any;
  notificationCreator((notification: any) => (notificationRef = notification));

  function genWrappedChildenByType(
    type: MessageType,
    content: Pick<Message, "content">,
    icon: Pick<Message, "icon">
  ) {
    const WrappedContent = (TypeIcon?: ReactNode) => {
      return (
        <section className={styles.content_wrapper}>
          <div className={styles.content_icon_wrapper}>{icon || TypeIcon}</div>
          <div className={styles.content_content_wrapper}>{content}</div>
        </section>
      );
    };

    const typeMaps = {
      [MessageType.success]: () =>
        WrappedContent(<SuccessIcon color={success} />),
      [MessageType.error]: () => {
        return (
          <section className={styles.content_wrapper}>
            <div className={styles.content_icon_wrapper}>
              {icon || <ErrorIcon color={error} />}
            </div>
            <div className={styles.content_content_wrapper}>{content}</div>
          </section>
        );
      },
      [MessageType.info]: () => {
        return (
          <section className={styles.content_wrapper}>
            <div className={styles.content_icon_wrapper}>
              {icon || <InfoIcon color={link} />}
            </div>
            <div className={styles.content_content_wrapper}>{content}</div>
          </section>
        );
      }
    };
    console.log(MessageType.error);
    const currentType = typeMaps[type] as () => ReactNode;
    return (currentType && currentType()) || content;
  }

  return {
    success: ({ content, icon, ...restMsg }: Message) => {
      notificationRef.notice({
        ...restMsg,
        children: genWrappedChildenByType(
          MessageType.success,
          content || "",
          icon || ""
        )
      });
    },
    error: ({ content, icon, ...restMsg }: Message) => {
      notificationRef.notice({
        ...restMsg,
        children: genWrappedChildenByType(
          MessageType.error,
          content || "",
          icon || ""
        )
      });
    },
    info: ({ content, icon, ...restMsg }: Message) => {
      notificationRef.notice({
        ...restMsg,
        children: genWrappedChildenByType(
          MessageType.info,
          content || "",
          icon || ""
        )
      });
    }
  };
}

export default message();

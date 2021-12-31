import { useMemo } from "react";
import type { MessageHandlers } from "./index";

const useMessage = (handlers: MessageHandlers) => {
  const messageApis = useMemo(() => handlers, []);
  return [messageApis];
};

export default useMessage;

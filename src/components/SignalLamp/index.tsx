import React from "react";
import "./index.less";

export enum SignalLampStatus {
  init = 0,
  working = 1,
  error = 2
}

export interface SignalLampProps {
  size?: number;
  status?: SignalLampStatus;
}

const SignalLamp: React.FC<SignalLampProps> = ({
  status = SignalLampStatus.init,
  size = 12
}) => {
  return (
    <span
      className={`signal-lamp-wrapper ${
        status === SignalLampStatus.init && `singal-lamp-init`
      } ${status === SignalLampStatus.working && `singal-lamp-working`} ${
        status === SignalLampStatus.error && `singal-lamp-error`
      }`}
      style={{ width: size, height: size }}
    />
  );
};

export default SignalLamp;

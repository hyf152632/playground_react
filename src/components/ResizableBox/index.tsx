import React, { FC, useState, useCallback, ReactNode } from "react";
import { Resizable } from "react-resizable";
import styles from "./index.module.css";

type Size = {
  width: number;
  height: number;
};

export interface ResizableBoxProps {
  defaultSize?: Size;
  children: (size: Size) => ReactNode;
  maxWidth?: number;
  minWidth?: number;
}

const ResizableBox: FC<ResizableBoxProps> = ({
  defaultSize = {
    width: 100,
    height: 200
  },
  children,
  maxWidth = Infinity,
  minWidth = -Infinity
}) => {
  const [size, setSize] = useState({
    width: defaultSize.width,
    height: defaultSize.height
  });

  const handleResize = useCallback(
    (_, { size }) => {
      const { width } = size;
      if (width >= maxWidth || width <= minWidth) {
        return;
      }
      setSize(size);
    },
    [maxWidth, minWidth]
  );

  const { width, height } = size;

  return (
    <div className={styles.wrapper} style={{ width, height }}>
      <Resizable
        width={width}
        height={height}
        onResize={handleResize}
        axis="x"
        minConstraints={[5, 5]}
        handle={<div className={styles.handle} />}
      >
        {children(size)}
      </Resizable>
    </div>
  );
};

export default ResizableBox;

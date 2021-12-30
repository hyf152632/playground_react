import {
  ChangeEvent,
  useState,
  useRef,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
  RefObject,
  CSSProperties,
  useEffect
} from "react";

type InputType = {
  type?: string;
  style?: CSSProperties;
  maxLength?: number;
  defaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: KeyboardEvent) => void;
  onValueCountChange?: (count: number) => void;
};

type RefType = {
  focus: () => void;
  rawInputRef: () => RefObject<HTMLInputElement>;
};

const Input = (
  {
    type,
    maxLength,
    style = {},
    defaultValue = "",
    value: valueFromProps = "",
    onChange,
    onPressEnter,
    onValueCountChange
  }: InputType,
  ref: ForwardedRef<RefType>
) => {
  const [value, setValue] = useState<string>(() => defaultValue || "");

  const inputRef = useRef<HTMLInputElement>(null);
  const isStartComposition = useRef(false);

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
    if (!isStartComposition.current) {
      if (onValueCountChange) {
        onValueCountChange(e.target.value.length);
      }
    }
  };

  const handleCompositionStart = () => {
    isStartComposition.current = true;
  };

  const handleCompositionEnd = () => {
    isStartComposition.current = false;
    const valueLen = inputRef.current?.value.length;
    if (typeof valueLen === "number") {
      if (onValueCountChange) {
        onValueCountChange(valueLen);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    rawInputRef: () => inputRef
  }));

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (onPressEnter) {
        onPressEnter(e);
      }
    }
  };

  useEffect(() => {
    setValue(valueFromProps);
  }, [valueFromProps]);

  useEffect(() => {
    setValue(defaultValue);
    if (onValueCountChange) {
      onValueCountChange(defaultValue.length);
    }
  }, [defaultValue, onValueCountChange]);

  return (
    <input
      type={type}
      style={style}
      ref={inputRef}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      value={value}
      onChange={handleValueChange}
      maxLength={maxLength}
      onKeyDown={handleKeyDown as any}
    />
  );
};

export default forwardRef(Input);

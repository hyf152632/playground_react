import { ReactNode } from "react";

type MultiProviderProps = {
  children: ReactNode;
  providers?: any[];
};

export default function MultiProvider({
  children,
  providers = []
}: MultiProviderProps) {
  let node = <>{children}</>;
  providers.forEach((Provider) => {
    node = <Provider>{node}</Provider>;
  });
  return node;
}

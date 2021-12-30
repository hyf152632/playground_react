// Copyright (c) 2021 Yongfei Huo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import React, { useContext, useReducer, ReactNode } from "react";

const defaultLanguage = "en";

export type tType = {
  (key: string): string;
  (key: string, alternative: string): string;
  (key: string, replacersObj: { [key: string]: any }): string;
};

export type I18nType = {
  lng: string;
  fallbackLng: string;
  resources: { [key: string]: any };
  changeLanguage: (lng: string) => void;
  t: tType;
  exists: (key: string) => boolean | string;
};

const i18nContext = React.createContext<I18nType>(null!);

const reducer = (
  state: any,
  action: { type: string; payload: { [key: string]: any } }
) => {
  const { type, payload } = action;
  if (type === "changeLanguage") {
    const { lng } = payload;
    return {
      ...state,
      lng
    };
  }

  return state;
};

function genInitI18nState(
  lng?: string,
  fallbackLng?: string,
  resources?: object
) {
  return {
    lng,
    fallbackLng,
    resources
  };
}

export const createI18nProvider = ({
  fallbackLng = defaultLanguage,
  lng = defaultLanguage,
  resources = {}
}) => ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    reducer,
    genInitI18nState(fallbackLng, lng, resources)
  );

  const changeLanguage = (lng = "") => {
    dispatch({
      type: "changeLanguage",
      payload: {
        lng
      }
    });
  };

  const exists = (key: string) => {
    const { lng, fallbackLng, resources } = state;
    const paths = key.split(".");

    let targetResources = resources[lng] || resources[fallbackLng] || {};

    let value;

    for (let i = 0; i < paths.length; i++) {
      const isExistCurrentResourceLayer =
        targetResources && targetResources.hasOwnProperty(paths[i]);
      if (isExistCurrentResourceLayer) {
        targetResources = targetResources[paths[i]];
      } else {
        break;
      }
      const isLast = i === paths.length - 1;
      if (isLast) {
        value = targetResources;
      }
    }

    if (value === undefined) {
      return false;
    }

    return String(value);
  };

  // example:
  //{
  //  "key": "{{what}} is {{how}}"
  // }
  // Sample
  // i18next.t('key', { what: 'i18next', how: 'great' });
  // -> "i18next is great"
  const t: tType = (key: string, alternativeOrReplacersObj?: any): string => {
    let value = exists(key);

    const isAlternative = typeof alternativeOrReplacersObj === "string";
    const isReplacersObj =
      alternativeOrReplacersObj &&
      typeof alternativeOrReplacersObj === "object";

    if (!value && isAlternative) {
      return alternativeOrReplacersObj;
    }

    if (!value && !isAlternative && !isReplacersObj) {
      return key;
    }

    if (value) {
      // "hello, {{who}}, {{what}} is {{how}}""
      // ['{{who}}', '{{what}}', '{{how}}']
      const replaceKeys = value.match(/{{([^}}|^{{]*)}}/g);

      if (!replaceKeys || !isReplacersObj) {
        return value;
      }

      replaceKeys.forEach((key: string) => {
        const bareKey = key.replace(/{{|}}/g, "");
        const valueByKey =
          bareKey in alternativeOrReplacersObj &&
          String(alternativeOrReplacersObj[bareKey]);
        if (typeof valueByKey === "string") {
          value = (value as string).replace(key, valueByKey);
        }
      });
    }
    return value as string;
  };

  const methods = {
    changeLanguage,
    exists: (key: string) => !!exists(key),
    t
  };

  return (
    <i18nContext.Provider value={{ ...state, ...methods }}>
      {children}
    </i18nContext.Provider>
  );
};

export const useTranslation = () => {
  return useContext(i18nContext);
};

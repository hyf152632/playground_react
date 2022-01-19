// Copyright (c) 2021 Yongfei Huo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import React, {
  useEffect,
  useCallback,
  useContext,
  ReactNode,
  useReducer
} from "react";

export enum ThemeItemsCanSetting {
  light = "light",
  dark = "dark",
  follow_sys = "follow_sys"
}

export enum Theme {
  light = "light",
  dark = "dark"
}

export const defaultTheme = ThemeItemsCanSetting.dark;
export const appThemeLocalStorgeKey = "__app_theme";

export interface UseThemeType {
  currentSysColorScheme: Theme;
  getCssVarByThemeMode: (varKey: string, themeMode?: Theme) => string;
  getCurrentThemeCssVar: (varKey: string) => string;
  currentTheme: Theme;
  setTheme: (theme: ThemeItemsCanSetting | Theme) => void;
}

const themeContext = React.createContext<UseThemeType>(null!);

themeContext.displayName = "themeContext";

export type CreateThemeProviderProps = {
  theme?: ThemeItemsCanSetting;
  themeLocalStorgeKey?: string;
};

const reducer = (state, action) => {
  const { type, payload } = action;

  if (type === "setCurrentSysColorScheme") {
    return {
      ...state,
      currentSysColorScheme: payload.value
    };
  }

  if (type === "setCurrentTheme") {
    const isFollowSys = payload?.value === ThemeItemsCanSetting.follow_sys;

    return {
      ...state,
      currentTheme:
        (isFollowSys && state.currentSysColorScheme) || payload?.value
    };
  }

  return state;
};

/**
 * @description create theme provider. use the css variable defined in the html root element; Todo: can also defined theme object in there
 */
export const createThemeProvider = (
  {
    theme = defaultTheme,
    themeLocalStorgeKey = appThemeLocalStorgeKey
  }: CreateThemeProviderProps = {
    theme: defaultTheme,
    themeLocalStorgeKey: appThemeLocalStorgeKey
  }
) =>
  // eslint-disable-next-line react/display-name
  ({ children }: { children: ReactNode }): JSX.Element => {
    const [{ currentTheme, currentSysColorScheme }, dispatch] = useReducer(
      reducer,
      null,
      () => {
        const currentSysColorScheme =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? Theme.dark
            : Theme.light;

        return {
          currentSysColorScheme,
          currentTheme:
            (theme === ThemeItemsCanSetting.follow_sys &&
              currentSysColorScheme) ||
            ((window.localStorage.getItem(themeLocalStorgeKey) ||
              defaultTheme) as ThemeItemsCanSetting)
        };
      }
    );

    useEffect(() => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (event) => {
          dispatch({
            type: "setCurrentSysColorScheme",
            payload: {
              value: event.matches ? Theme.dark : Theme.light
            }
          });
        });
    }, []);

    /**
     * @description: get the css var defined in the html root element
     * @param {string} varKey - the css var name, not need '--' prefix
     * @param {string} [themeMode=light] - the theme mode, default is light
     * @return {string} the css var value
     */
    const getCssVarByThemeMode = useCallback(
      (varKey: string, themeMode: Theme = Theme.light) => {
        const computedVarKey =
          themeMode === Theme.light ? `--${varKey}` : `--dark-${varKey}`;
        return window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(computedVarKey)
          .trim();
      },
      []
    );

    /**
     * @description get css variable defined in the html root element
     * @example:
     * getCurrentThemeCssVar('main-color');
     * return '#fff'; if current theme is light
     * return '#000'; if current theme is dark
     * css variable defined in the html root element:
     * :root {
     *  --main-color: #fff;
     * --dark-main-color: #000;
     * }
     */
    const getCurrentThemeCssVar = useCallback(
      (varKey: string) => {
        return currentTheme === ThemeItemsCanSetting.light
          ? getCssVarByThemeMode(varKey)
          : currentTheme === ThemeItemsCanSetting.follow_sys
          ? getCssVarByThemeMode(varKey, currentSysColorScheme)
          : getCssVarByThemeMode(varKey, Theme.dark);
      },
      [currentSysColorScheme, currentTheme, getCssVarByThemeMode]
    );

    const setTheme = useCallback((theme: ThemeItemsCanSetting | Theme) => {
      window.localStorage.setItem(appThemeLocalStorgeKey, theme);
      dispatch({
        type: "setCurrentTheme",
        payload: {
          value: theme
        }
      });
    }, []);

    return (
      <themeContext.Provider
        value={{
          currentSysColorScheme,
          getCssVarByThemeMode,
          getCurrentThemeCssVar,
          currentTheme,
          setTheme
        }}
      >
        {children}
      </themeContext.Provider>
    );
  };

export const useTheme = (): UseThemeType => {
  return useContext(themeContext);
};

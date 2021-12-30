import { render } from "react-dom";
import MultiProvider from "./utils/MultiProvider";
import { ThemeProvider } from "./theme";
import I18nProvider from "./i18n_init";
import "styles/base.css";

import App from "./App";

const rootElement = document.getElementById("root");
render(
  <MultiProvider providers={[ThemeProvider, I18nProvider]}>
    <App />
  </MultiProvider>,
  rootElement
);

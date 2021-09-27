import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "hero-design";
import "hero-design/styles/index.css";
import Badge from "../Badge";

const renderApp = (container: HTMLDivElement) =>
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <Badge />
      </ThemeProvider>
    </React.StrictMode>,
    container
  );

export { renderApp };

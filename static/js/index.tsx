import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import CustomCursor from "./CustomCursor";
import { Global, css } from "@emotion/react";
import Home from "./Home";
import { SynOs } from "./SynOs";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const globalStyles = css`
  a,
  a:visited {
    color: yellow;
    cursor: none;
  }

  body {
    background-color: #15101c;
    background-image: url(/stars.png);
    overflow-x: hidden;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/syn-os",
        element: <SynOs />,
      },
    ],
  },
]);

root.render(
  <>
    <Global styles={globalStyles} />
    <CustomCursor />
    <RouterProvider router={router} />
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

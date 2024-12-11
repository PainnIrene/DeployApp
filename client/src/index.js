import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PaymentProvider from "./providers/PaymentProvider";
import GlobalStyles from "./components/Global";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <PaymentProvider>
      <GlobalStyles>
      <App />
      </GlobalStyles>
    </PaymentProvider>
  </React.StrictMode>
);

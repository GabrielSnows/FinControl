import React from "react";
import ReactDOM from "react-dom/client";

import { registerSW } from "virtual:pwa-register";

import "./index.css";
import App from "./app/App";

registerSW({
  immediate: true,

  onRegisteredSW(
    serviceWorkerUrl,
    registration,
  ) {
    console.log(
      "FinControl instalado como PWA:",
      serviceWorkerUrl,
    );

    if (registration) {
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000,
      );
    }
  },

  onRegisterError(error) {
    console.error(
      "Erro ao registrar a PWA:",
      error,
    );
  },
});

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
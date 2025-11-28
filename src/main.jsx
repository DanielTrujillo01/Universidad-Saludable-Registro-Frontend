import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RegisterRoutes from "./routes/RegisterRoutes.jsx";
import { Toaster } from "sonner";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RegisterRoutes />
      <Toaster richColors closeButton duration={2500} />
    </BrowserRouter>
  </React.StrictMode>
);

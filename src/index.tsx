'use client'
import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { builder } from "@builder.io/react";
import registerBuilderComponents from "./components/RegisterComponents";

// Initialize Builder with your public API key
builder.apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";

// Register your custom components
registerBuilderComponents()

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

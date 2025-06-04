import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { Builder } from "@builder.io/react"
import { registerBuilderComponents } from "./builder/register-components"

// Initialize Builder with your public API key
Builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY || "")

// Register your custom components
registerBuilderComponents()

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

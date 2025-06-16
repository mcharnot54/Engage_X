'use client'

import { useEffect, useState } from "react"
import { builder, BuilderComponent } from '@builder.io/react';

// This is an example of a page that combines your custom React code with Builder.io content
export default function Home() {
  const [builderContent, setBuilderContent] = useState(null)

  useEffect(() => {
    async function fetchContent() {
      // Fetch the Builder.io content for the home page
      const content = await builder
        .get("page", {
          url: "/",
          cachebust: true,
        })
        .promise()

      setBuilderContent(content)
    }

    fetchContent()
  }, [])

  return (
    <div className="home-page">
      {/* Your custom React components */}
      <header className="app-header">
        <h1>Welcome to EngageX</h1>
        <p>Your custom React header content</p>
      </header>

      {/* Builder.io content */}
      {builderContent && <BuilderComponent model="page" content={builderContent} />}

      {/* More of your custom React components */}
      <footer className="app-footer">
        <p>© 2025 EngageX. All rights reserved.</p>
      </footer>
    </div>
  )
}

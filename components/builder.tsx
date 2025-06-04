import { builder } from "@builder.io/sdk"
// Fix the import path to correctly point to src/components/builder.tsx
import RenderBuilderContent from "./builder"
import type { Metadata } from "next"

// Builder Public API Key set in .env file
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!)

// Define a single, correct props interface
interface PageProps {
  params: {
    page?: string[]
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Figma Imports",
    description: "Import your Figma designs",
  }
}

const builderModelName = "page" // or the appropriate model name you want to use

// Make sure this is the only default export
export default async function Page({ params, searchParams }: PageProps) {
  // Use optional chaining and nullish coalescing for safer access
  const urlPath = "/" + (params?.page?.join("/") || "")

  const content = await builder
    // Get the page content from Builder with the specified options
    .get(builderModelName, {
      userAttributes: {
        // Use the page path specified in the URL to fetch the content
        urlPath: urlPath,
      },
      // Add cache busting for preview mode if needed
      cachebust: searchParams?.preview === "true",
    })
    // Convert the result to a promise
    .toPromise()

  return (
    <main>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} model={builderModelName} />
    </main>
  )
}

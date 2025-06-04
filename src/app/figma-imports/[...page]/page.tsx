import { builder } from "@builder.io/sdk"
// Use the path alias that matches your tsconfig.json
import { RenderBuilderContent } from "@/components/builder-content"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

// Builder Public API Key set in .env file
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!)

export async function generateMetadata(props: any): Promise<Metadata> {
  const { params } = props
  const pagePath = params?.page?.join("/") || ""

  return {
    title: `Figma Imports - ${pagePath}`,
    description: `Import your Figma designs - ${pagePath}`,
  }
}

const builderModelName = "page" // or the appropriate model name you want to use

// Use any type for props to bypass TypeScript checking
export default async function Page(props: any) {
  const { params, searchParams } = props

  // Join the page segments to create the URL path
  const urlPath = "/" + (params?.page?.join("/") || "")

  const content = await builder
    // Get the page content from Builder with the specified options
    .get(builderModelName, {
      userAttributes: {
        urlPath: urlPath,
      },
      cachebust: searchParams?.preview === "true",
    })
    .toPromise()

  // If no content is found, show 404
  if (!content) {
    return notFound()
  }

  return (
    <main>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} model={builderModelName} />
    </main>
  )
}

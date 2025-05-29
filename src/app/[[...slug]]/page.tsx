// app/[[...slug]]/page.tsx

import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "@/components/builder-content";
import type { Metadata, ResolvingMetadata } from "next";

// Initialize Builder for server-side fetching
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

// Optionally generate metadata based on entry
export async function generateMetadata(
  { params }: { params: { slug?: string[] } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slugArray = params.slug || [];
  const urlPath = slugArray.length > 0 ? `/${slugArray.join("/")}` : "/";
  const entry = await builder.get("page", { userAttributes: { urlPath } }).promise();
  return {
    title: entry?.data?.title || "Builder Page",
    description: entry?.data?.description || undefined,
  };
}

export default async function Page(
  { params }: { params: { slug?: string[] } }
) {
  const slugArray = params.slug || [];
  const urlPath = slugArray.length > 0 ? `/${slugArray.join("/")}` : "/";

  const entry = await builder
    .get("page", { userAttributes: { urlPath } })
    .promise();

  if (!entry) {
    return <h1>404: Page Not Found</h1>;
  }

  return (
    <main style={{ padding: 24 }}>
      <RenderBuilderContent model="page" entry={entry} />
    </main>
  );
}
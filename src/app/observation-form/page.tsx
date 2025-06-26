"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

export default function ObservationForm() {
  const [content, setContent] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
    
    console.log("Starting Builder.io fetch...");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length);

    if (!apiKey) {
      setError("❌ No API key found");
      setLoading(false);
      return;
    }

    try {
      builder.init(apiKey);
      console.log("Builder initialized");

      // Add timeout to prevent hanging
      const fetchWithTimeout = Promise.race([
        builder.getAll("page", { limit: 10 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout after 10 seconds")), 10000)
        )
      ]);

      fetchWithTimeout
        .then((pages) => {
          console.log("✅ Success! Pages received:", pages);
          setAllPages(pages || []);
          
          if (pages && pages.length > 0) {
            // Look for observation form
            const obsForm = pages.find(p => 
              p.name && (
                p.name.toLowerCase().includes("observation") ||
                p.name === "ObservationForm"
              )
            );
            
            if (obsForm) {
              console.log("🎯 Found ObservationForm:", obsForm.name);
              setContent(obsForm);
            } else {
              console.log("📝 Using first available page:", pages[0].name);
              setContent(pages[0]);
            }
            
            setDebug({
              totalPages: pages.length,
              pageNames: pages.map(p => p.name),
              foundObservation: !!obsForm
            });
          } else {
            setError("⚠️ No pages found in Builder.io");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Builder.io error:", err);
          setError(`API Error: ${err.message}`);
          setDebug({ errorDetails: err.toString() });
          setLoading(false);
        });

    } catch (initError) {
      console.error("❌ Initialization error:", initError);
      setError(`Init Error: ${initError.message}`);
      setLoading(false);
    }
  }, []);

  const selectPage = (page) => {
    setContent(page);
  };

  if (loading) {
    return (Loading Builder.io...This should take less than 10 seconds);
  }

  if (error) {
    return (Builder.io Error{error}Debug Info{JSON.stringify(debug, null, 2)}Quick Fixes:Check your .env.local file has NEXT_PUBLIC_BUILDER_API_KEYVerify the API key is from your EngageX space in Builder.ioMake sure your ObservationForm content is published);
  }

  if (content) {
    return (✅Builder.io Content:{content.name}Found {allPages.length} total pagessetContent(null)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Browse All Pages);
  }

  // Page selector view
  return (🎯 Builder.io Content Found!Found{allPages.length}pages. Select your ObservationForm:{allPages.map((page, index) => ({page.name || "Untitled"}ID: {page.id}{page.name?.toLowerCase().includes("observation") && (🎯 OBSERVATION FORM)}selectPage(page)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Load This Page))});
}
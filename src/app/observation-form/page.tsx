"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

export default function ObservationForm() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

    if (!apiKey) {
      setError("Builder API key not found");
      setLoading(false);
      return;
    }

    builder.init(apiKey);
    
    builder.getAll("page")
      .then((pages) => {
        console.log("Pages found:", pages);
        
        if (pages && pages.length > 0) {
          const observationForm = pages.find(p => 
            p.name && p.name.toLowerCase().includes("observation")
          );
          
          if (observationForm) {
            setContent(observationForm);
          } else {
            setContent(pages[0]);
          }
        } else {
          setError("No content found in Builder.io");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Builder error:", err);
        setError("Failed to load content: " + err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (Loading...Loading Builder.io content...);
  }

  if (error) {
    return (Error{error}</piv
  }

  if (content) {
    return (Content loaded:{content.name});
  }

  return (No ContentNo Builder.io content found</piv
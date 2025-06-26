"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

export default function ObservationForm() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

    if (!apiKey) {
      setError("No API key");
      setLoading(false);
      return;
    }

    builder.init(apiKey);

    // Try EVERY possible way to get content
    const fetchContent = async () => {
      try {
        console.log("=== TESTING ALL MODELS ===");
        
        // Test all possible models
        const models = ["page", "content", "section", "symbol", "data"];
        let results = {};
        
        for (const model of models) {
          try {
            const data = await builder.getAll(model, { limit: 10 });
            results[model] = data?.length || 0;
            console.log(`${model}: ${data?.length || 0} items`);
            
            if (data && data.length > 0) {
              console.log(`✅ FOUND CONTENT IN ${model}:`, data);
              setContent(data[0]); // Use first item
              setDebug({ successModel: model, allResults: results });
              setLoading(false);
              return;
            }
          } catch (err) {
            results[model] = `Error: ${err.message}`;
            console.log(`${model}: ERROR -`, err.message);
          }
        }
        
        // If nothing found, show debug info
        setError("No content found in any model");
        setDebug({ allResults: results });
        setLoading(false);
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (Testing All Builder.io Models...</hCheck console for detailed results);
  }

  if (error) {
    return (Debug Results{error}Model Test Results:{JSON.stringify(debug, null, 2)}Next Steps:Check console logs above for which models were testedGo to Builder.io → verify "ObservationForm" exists and is PUBLISHEDNote which section/tab your content is under in Builder.io</liVerify you're in the correct space (EngageX));
  }

  if (content) {
    return (✅SUCCESS!Found content: {content.name}Model: {debug.successModel});
  }

  return (Unexpected state);
}
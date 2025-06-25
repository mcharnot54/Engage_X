"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

export default function ObservationForm() {
  const [allPages, setAllPages] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

    if (!apiKey) {
      setError("Builder API key not found. Please set NEXT_PUBLIC_BUILDER_API_KEY environment variable.");
      setLoading(false);
      return;
    }

    builder.init(apiKey);
    
    setTimeout(async () => {
      const debugData = {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyStart: apiKey?.substring(0, 8) + "...",
        nodeEnv: process.env.NODE_ENV,
        builderInitialized: !!builder.apiKey,
      };

      console.log("🔍 Debug info:", debugData);

      try {
        // Try multiple models to find content
        console.log("🚀 Testing multiple content models...");
        
        const models = ["page", "content", "section", "symbol"];
        let allResults = {};
        
        for (const model of models) {
          try {
            console.log(`📄 Testing model: ${model}`);
            const result = await builder.getAll(model, {
              limit: 50,
              includeRefs: true,
              cachebust: true,
            });
            allResults[model] = result ? result.length : 0;
            console.log(`📊 Model "${model}" returned ${result ? result.length : 0} items`);
            
            if (result && result.length > 0) {
              setAllPages(result);
              console.log(`✅ Found content in "${model}" model:`, result);
              
              // Look for ObservationForm
              const observationPage = result.find(
                (p) =>
                  p.name?.toLowerCase().includes("observationform") ||
                  p.name === "ObservationForm" ||
                  p.name?.toLowerCase().includes("observation")
              );

              if (observationPage) {
                console.log("🎯 Found ObservationForm:", observationPage);
                setSelectedContent(observationPage);
              }
              
              setDebugInfo({...debugData, successfulModel: model, modelResults: allResults});
              setLoading(false);
              return;
            }
          } catch (modelErr) {
            console.error(`❌ Error with model ${model}:`, modelErr);
            allResults[model] = `Error: ${modelErr.message}`;
          }
        }

        // If no content found in any model
        setError(`No content found in any Builder.io model. Checked: ${models.join(", ")}`);
        setDebugInfo({...debugData, modelResults: allResults, totalModelsChecked: models.length});
        setLoading(false);

      } catch (err) {
        console.error("💥 General error:", err);
        setError(`Failed to fetch Builder.io content: ${err.message || err}`);
        setDebugInfo({...debugData, generalError: err.message});
        setLoading(false);
      }
    }, 100);
  }, []);

  const handleSelectPage = (page: any) => {
    setSelectedContent(page);
  };

  if (loading) {
    return (🔍 Scanning Builder.io Models...Testing: page, content, section, symbol models...);
  }

  if (error) {
    return (🔍 Builder.io Scan Results{error}📊 Model Scan Results:{JSON.stringify(debugInfo, null, 2)}</pre🔧 Next Steps:Check Builder.io Dashboard:Go to builder.io and verify your "ObservationForm" content exists and is publishedVerify Space:Make sure you're in the correct "EngageX" spaceCheck Content Model:Note which tab/section your content is under in Builder.ioAPI Key Permissions:Ensure your API key has read access to published content);
  }

  if (selectedContent) {
    return (✅Builder.io Content Loaded:{selectedContent.name}Found in model:{debugInfo.successfulModel}setSelectedContent(null)}
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              ← Back to Content List);
  }

  return (🎯 Found Builder.io Content!✅ Success!Found {allPages.length} items in the{debugInfo.successfulModel}modelClick "Load This Content" on your ObservationFormAvailable Content ({allPages.length}){allPages.map((page, index) => ({page.name || "Untitled Page"}ID:{page.id}Model:{debugInfo.successfulModel}URL:{page.data?.url || "No URL set"}{(page.name?.toLowerCase().includes("observationform") || page.name?.toLowerCase().includes("observation")) && (🎯 OBSERVATION FORM DETECTED!)}handleSelectPage(page)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Load This Content))}🔧 Technical Details (Click to expand)</summary{JSON.stringify({...debugInfo, totalPages: allPages.length}, null, 2)}</preails
}
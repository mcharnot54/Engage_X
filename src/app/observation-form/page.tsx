useEffect(() => {
  // Check environment and API key
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

  setDebugInfo({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    builderInitialized: !!builder.apiKey,
  });

  // Initialize Builder if not already done
  if (!builder.apiKey && apiKey) {
    builder.init(apiKey);
  }

  if (!builder.apiKey) {
    setError(
      "Builder API key not found. Please set NEXT_PUBLIC_BUILDER_API_KEY environment variable.",
    );
    setLoading(false);
    return;
  }

  // Just try the default "page" model first
  builder
    .getAll("page", {
      limit: 50,
      includeRefs: true,
    })
    .then((pages) => {
      console.log("All Builder.io pages:", pages);
      setAllPages(pages);

      // Look for "ObservationForm" content
      const observationPage = pages.find(
        (p) =>
          p.name?.toLowerCase().includes("observationform") ||
          p.name === "ObservationForm" ||
          p.name?.toLowerCase().includes("observation"),
      );

      if (observationPage) {
        console.log("Found observation page:", observationPage);
        setSelectedContent(observationPage);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error("Builder fetch error:", err);
      setError(`Failed to fetch Builder.io content: ${err.message}`);
      setLoading(false);
    });
}, []);
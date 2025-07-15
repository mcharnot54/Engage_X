"use client";
import { builder, Builder } from "@builder.io/react";

let isInitialized = false;

export function initializeBuilderWithResponsive() {
  // Only initialize once
  if (isInitialized || typeof window === "undefined") {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

  if (!apiKey) {
    console.warn(
      "NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.",
    );
    return;
  }

  // Initialize Builder
  if (!builder.apiKey) {
    builder.init(apiKey);
  }

  // Configure responsive breakpoints and other settings
  Builder.set({
    canTrack: false,
    env: process.env.NODE_ENV === "production" ? "production" : "development",
    hideDefaultBuilderBlocks: ["Image"],
    // Custom breakpoints for responsive design in Builder.io editor
    customBreakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
    },
    // Enable responsive mode
    editorMode: "preview",
    // Ensure proper viewport handling
    viewportMode: "responsive",
  });

  // Set device attributes for targeting
  const getDeviceType = () => {
    if (window.innerWidth <= 480) return "mobile";
    if (window.innerWidth <= 768) return "tablet";
    return "desktop";
  };

  builder.setUserAttributes({
    device: getDeviceType(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  // Update device type on resize
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      builder.setUserAttributes({
        device: getDeviceType(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    }, 100);
  });

  isInitialized = true;
}

// Note: Don't auto-initialize to prevent SSG issues
// Components should call initializeBuilderWithResponsive() explicitly

import { useState, useEffect } from 'react';

/**
 * Custom hook that returns the current visual viewport height.
 * This is useful for handling on-screen keyboards on mobile devices.
 * Falls back to window.innerHeight if Visual Viewport API is not supported.
 */
export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number>(() => {
    // Initialize with current viewport height if available
    if (typeof window !== 'undefined') {
      return window.visualViewport?.height ?? window.innerHeight;
    }
    return 0;
  });

  useEffect(() => {
    const updateViewportHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        // Fallback for browsers that don't support Visual Viewport API
        setViewportHeight(window.innerHeight);
      }
    };

    // Set initial height
    updateViewportHeight();

    // Listen for viewport changes
    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', updateViewportHeight);
      return () => {
        viewport.removeEventListener('resize', updateViewportHeight);
      };
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', updateViewportHeight);
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
      };
    }
  }, []);

  return viewportHeight;
} 
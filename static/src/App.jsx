import { useEffect, useRef } from "react";
import bodyHTML from "./bodyHTML";
import headCSS from "./headCSS";
import inlineScripts from "./inlineScripts";

// External scripts to load in order (same as original index.html)
const EXTERNAL_SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
  "js/ai_toggle.js?v=3",
  "js/mobile_menu.js?v=2",
];

// Load a script tag dynamically, returns a promise
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Avoid double-loading
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = resolve; // Don't block on local script errors
    document.body.appendChild(s);
  });
}

// Execute an inline script string in global scope
function runInlineScript(code) {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(code);
    fn.call(window);
  } catch (e) {
    // Silently ignore errors from scripts that depend on DOM timing
    console.warn("Script execution warning:", e.message);
  }
}

export default function App() {
  const rootRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1. Inject the head-level CSS into a <style> tag in <head>
    const styleTag = document.createElement("style");
    styleTag.id = "ym-head-styles";
    styleTag.textContent = headCSS;
    document.head.appendChild(styleTag);

    // 2. Inject the body HTML into the root div
    if (rootRef.current) {
      rootRef.current.innerHTML = bodyHTML;
    }

    // 3. Load external scripts in sequence, then run inline scripts
    const run = async () => {
      for (const src of EXTERNAL_SCRIPTS) {
        await loadScript(src);
      }
      // Small delay to ensure DOM is ready
      await new Promise((r) => setTimeout(r, 50));
      // Run all inline scripts in order
      for (const code of inlineScripts) {
        runInlineScript(code);
      }
    };

    run();

    // Cleanup on unmount
    return () => {
      const s = document.getElementById("ym-head-styles");
      if (s) s.remove();
    };
  }, []);

  return <div ref={rootRef} id="ym-page-root" />;
}

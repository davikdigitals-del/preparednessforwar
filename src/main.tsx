import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import App from "./App.tsx";
import "./index.css";
import { OfflineService } from "./services/OfflineService";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ── Supabase auth hash interceptor ──────────────────────────────────────────
// Supabase emails link to the Site URL (homepage) with the token in the hash.
// If we detect a recovery token in the hash, redirect to /reset-password
// immediately before React mounts, preserving the full hash so the page
// can extract the access_token.
(function interceptAuthHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const type = params.get("type");
  if (type === "recovery" && !window.location.pathname.includes("/reset-password")) {
    window.location.replace("/reset-password" + window.location.hash);
  }
})();
// ────────────────────────────────────────────────────────────────────────────

// Register service worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    OfflineService.registerServiceWorker().then((registered) => {
      if (registered) {
        console.log('✅ PWA: Service Worker registered - Offline mode enabled');
      }
    });
  });
}

// Wrapper that removes the loader only after React has committed to the DOM
function AppWithLoaderRemoval() {
  useEffect(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.remove();
  }, []);

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<AppWithLoaderRemoval />);

import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import App from "./App.tsx";
import "./index.css";
import { OfflineService } from "./services/OfflineService";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ── Supabase auth interceptor ────────────────────────────────────────────────
// Handles both PKCE (?code=) and implicit (#access_token=) recovery flows.
// If a recovery token is detected on any page other than /reset-password,
// redirect there preserving the full query string / hash.
(function interceptAuthToken() {
  const isResetPage = window.location.pathname.includes("/reset-password");
  if (isResetPage) return;

  // PKCE flow: ?code=xxx (Supabase default since 2024)
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("code")) {
    window.location.replace("/reset-password" + window.location.search);
    return;
  }

  // Implicit flow: #access_token=xxx&type=recovery
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (hashParams.get("type") === "recovery") {
    window.location.replace("/reset-password" + window.location.hash);
  }
})();
// ─────────────────────────────────────────────────────────────────────────────

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

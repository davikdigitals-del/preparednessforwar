import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import App from "./App.tsx";
import "./index.css";
import { OfflineService } from "./services/OfflineService";
import { ErrorBoundary } from "./components/ErrorBoundary";

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

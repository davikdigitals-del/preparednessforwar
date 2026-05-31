import { createRoot } from "react-dom/client";
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


const root = createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Remove loading screen after React mounts
requestAnimationFrame(() => {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
});

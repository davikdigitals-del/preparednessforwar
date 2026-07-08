import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
  height?: string;
}

const SCRIPT_SRC = "/svg-world-map/svg-world-map.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

export const InteractiveWorldMap = ({
  onCountryClick,
  height = "100%",
}: InteractiveWorldMapProps) => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

    const init = async () => {
      try {
        await loadScript(SCRIPT_SRC);
        if (cancelled) return;

        const ts = Date.now();
        const clickCb = `_mapClick_${ts}`;
        const overCb  = `_mapOver_${ts}`;
        const outCb   = `_mapOut_${ts}`;

        (window as any)[clickCb] = (data: any) => {
          if (!data) return;
          // Get the 2-letter ISO code — prefer parent country id over sub-path id
          const code = (data.country?.id || (data.id?.length === 2 ? data.id : null) || "").toLowerCase();
          if (!code || code === "ocean" || code === "world") return;
          if (onCountryClick) onCountryClick(code);
          else navigate(`/countries/${code}`);
        };

        (window as any)[overCb] = (data: any, event: any) => {
          if (!data) return;
          // The library passes a path/province object.
          // The country is on data.country (parent group), and the 2-letter ISO id is data.country.id or data.id (if top-level)
          // Country name is on data.country.name or data.name
          let name = "";
          let code = "";

          if (data.country) {
            // Sub-path (province/state) — use parent country
            name = data.country.name || "";
            code = data.country.id || "";
          } else if (data.id && data.id.length === 2 && data.name) {
            // Top-level country element
            name = data.name;
            code = data.id;
          } else if (data.id && data.id.length === 2) {
            // Has 2-letter code but no name — look up from countryData
            name = data.id.toUpperCase();
            code = data.id;
          }

          // Skip ocean, world, and raw path IDs like "path2812"
          if (!name || name === "Ocean" || name === "World" || /^path\d+/i.test(name)) return;
          if (code && (code.toLowerCase() === "ocean" || code.toLowerCase() === "world")) return;

          // Get mouse position from the event if available
          const x = event?.clientX || 0;
          const y = event?.clientY || 0;
          setTooltip({ name, x, y });
        };

        (window as any)[outCb] = () => setTooltip(null);

        // Inject a style to keep the library container invisible while it lives on body
        // This prevents the full-screen flash on page load/refresh
        if (!document.getElementById("_map_hide_style")) {
          const style = document.createElement("style");
          style.id = "_map_hide_style";
          style.textContent = `body > #svg-world-map-container { visibility: hidden !important; position: fixed !important; top: -9999px !important; }`;
          document.head.appendChild(style);
        }

        // Remove stale library container so the library re-creates it fresh
        const staleContainer = document.getElementById("svg-world-map-container");
        if (staleContainer) staleContainer.remove();

        // svgWorldMap is the IIFE-returned function, already on window after script loads
        const mapFn = (window as any).svgWorldMap;
        if (typeof mapFn !== "function") throw new Error("svgWorldMap library not available");

        await mapFn({
          libPath: "/svg-world-map/",
          bigMap: false,
          showOcean: true,
          showAntarctica: false,
          showLabels: false,
          showMicroLabels: false,
          showMicroStates: true,
          showInfoBox: false,
          oceanColor: "#dbeafe",
          worldColor: "#e2e8f0",
          countryStroke: { out: "#94a3b8", over: "#1e40af", click: "#1e3a8a" },
          mapClick: clickCb,
          mapOver:  overCb,
          mapOut:   outCb,
        });

        if (cancelled) return;

        // Move the library-created container into our wrapper
        const libContainer = document.getElementById("svg-world-map-container");
        if (libContainer && wrapperRef.current) {
          wrapperRef.current.appendChild(libContainer);
          // Now visible inside wrapper — override the hide style
          libContainer.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;margin:0;padding:0;visibility:visible;";
          const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          if (svgObj) {
            svgObj.style.cssText = "width:100%;height:100%;display:block;border:none;";
          }
          
          // Track mouse globally for tooltip positioning
          mouseMoveHandler = (e: MouseEvent) => {
            setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
          };
          window.addEventListener("mousemove", mouseMoveHandler);
        }

        setStatus("ready");
      } catch (err: any) {
        if (!cancelled) { setErrorMsg(err?.message || "Failed to load map"); setStatus("error"); }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mouseMoveHandler) {
        window.removeEventListener("mousemove", mouseMoveHandler);
      }
      const libContainer = document.getElementById("svg-world-map-container");
      if (libContainer) {
        libContainer.style.display = "none";
        document.body.appendChild(libContainer);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full overflow-hidden bg-blue-50" style={{ height }}>

      {/* Loading */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading world map…</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <p className="text-sm text-red-500 font-semibold mb-2">Map failed to load</p>
          <p className="text-xs text-gray-400 mb-4">{errorMsg}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-1.5 text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Country name tooltip */}
      {tooltip && status === "ready" && (
        <div
          className="pointer-events-none fixed z-50 px-2 py-1 bg-blue-900 text-white text-xs font-bold rounded shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
};

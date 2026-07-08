import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CountryClickEvent } from "@/types/svg-world-map";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
  height?: string; // e.g. "420px" or "100vh"
}

const SCRIPT_SRC = "/svg-world-map/svg-world-map.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
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

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // 1. Load the library script
        await loadScript(SCRIPT_SRC);
        if (cancelled) return;

        // 2. Set up named global callbacks
        const ts = Date.now();
        const clickCb = `svgMapClick_${ts}`;
        const overCb  = `svgMapOver_${ts}`;
        const outCb   = `svgMapOut_${ts}`;

        (window as any)[clickCb] = (country: CountryClickEvent) => {
          const code = country.id?.toLowerCase();
          if (!code || code === "ocean" || code === "world") return;
          if (onCountryClick) {
            onCountryClick(code);
          } else {
            navigate(`/countries/${code}`);
          }
        };
        (window as any)[overCb] = () => {};
        (window as any)[outCb]  = () => {};

        // 3. Initialise the map
        const instance = await (window as any).svgWorldMap({
          libPath: "/svg-world-map/",
          bigMap: false, // use world-states.svg (smaller, no provinces — loads faster)
          showOcean: true,
          showAntarctica: false,
          showLabels: false,
          showMicroLabels: false,
          showMicroStates: true,
          showInfoBox: false,
          oceanColor: "#dbeafe",
          worldColor: "#f8fafc",
          countryStroke: { out: "#cbd5e1", over: "#1e40af", click: "#1e3a8a" },
          mapClick: clickCb,
          mapOver:  overCb,
          mapOut:   outCb,
        });

        if (cancelled) return;

        // 4. The library prepends #svg-world-map-container to document.body.
        //    Move it into our wrapper div instead.
        const libContainer = document.getElementById("svg-world-map-container");
        if (libContainer && wrapperRef.current) {
          // Re-parent it
          wrapperRef.current.appendChild(libContainer);
          // Make it fill the wrapper
          libContainer.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;";
          const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          if (svgObj) {
            svgObj.style.cssText = "width:100%;height:100%;display:block;";
          }
        }

        setStatus("ready");
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || "Failed to load map");
          setStatus("error");
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      // Move the library container back to body on unmount so it doesn't break
      // if the component is remounted (the library won't re-create it)
      const libContainer = document.getElementById("svg-world-map-container");
      if (libContainer && libContainer.parentElement !== document.body) {
        libContainer.style.cssText = "display:none;";
        document.body.appendChild(libContainer);
      }
    };
  }, []); // run once

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden bg-blue-50"
      style={{ height }}
    >
      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading world map…</p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <p className="text-sm text-red-500 font-semibold mb-2">Map failed to load</p>
          <p className="text-xs text-gray-400 mb-4">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

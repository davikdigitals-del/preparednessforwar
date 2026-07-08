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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeNameRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Show/hide tooltip by direct DOM manipulation (no state = no lag)
  const showTooltip = (name: string, clientX: number, clientY: number) => {
    if (!tooltipRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    tooltipRef.current.textContent = name;
    tooltipRef.current.style.left = `${clientX - rect.left}px`;
    tooltipRef.current.style.top = `${clientY - rect.top - 12}px`;
    tooltipRef.current.style.display = "block";
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
    activeNameRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;

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
          const code = (data.country?.id || (data.id?.length === 2 ? data.id : null) || "").toLowerCase();
          if (!code || code === "ocean" || code === "world") return;
          if (onCountryClick) onCountryClick(code);
          else navigate(`/countries/${code}`);
        };

        (window as any)[overCb] = (data: any) => {
          if (!data) return;
          let name = "";
          let code = "";
          if (data.country) {
            name = data.country.name || "";
            code = data.country.id || "";
          } else if (data.id && data.id.length === 2 && data.name) {
            name = data.name;
            code = data.id;
          } else if (data.id && data.id.length === 2) {
            name = data.id.toUpperCase();
            code = data.id;
          }
          if (!name || name === "Ocean" || name === "World" || /^path\d+/i.test(name)) return;
          if (code && (code.toLowerCase() === "ocean" || code.toLowerCase() === "world")) return;
          // Store name — overlay mousemove will position it
          activeNameRef.current = name;
        };

        (window as any)[outCb] = () => hideTooltip();

        if (!document.getElementById("_map_hide_style")) {
          const style = document.createElement("style");
          style.id = "_map_hide_style";
          style.textContent = `body > #svg-world-map-container { visibility: hidden !important; position: fixed !important; top: -9999px !important; }`;
          document.head.appendChild(style);
        }

        const staleContainer = document.getElementById("svg-world-map-container");
        if (staleContainer) staleContainer.remove();

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

        const libContainer = document.getElementById("svg-world-map-container");
        if (libContainer && wrapperRef.current) {
          wrapperRef.current.appendChild(libContainer);
          libContainer.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;margin:0;padding:0;visibility:visible;";
          const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          if (svgObj) {
            svgObj.style.cssText = "width:100%;height:100%;display:block;border:none;";
          }
        }

        setStatus("ready");
      } catch (err: any) {
        if (!cancelled) { setErrorMsg(err?.message || "Failed to load map"); setStatus("error"); }
      }
    };

    init();

    return () => {
      cancelled = true;
      const libContainer = document.getElementById("svg-world-map-container");
      if (libContainer) {
        libContainer.style.display = "none";
        document.body.appendChild(libContainer);
      }
    };
  }, []);

  // Overlay handlers — this div sits above the SVG object and captures
  // real mousemove events from the parent document
  const onOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeNameRef.current) {
      showTooltip(activeNameRef.current, e.clientX, e.clientY);
    }
  };

  const onOverlayMouseLeave = () => hideTooltip();

  // Forward clicks through the overlay to the SVG object beneath
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = e.currentTarget as HTMLDivElement;
    overlay.style.display = "none";
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.display = "";
    if (el && "click" in el) (el as HTMLElement).click();
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={(e) => { if (activeNameRef.current) showTooltip(activeNameRef.current, e.clientX, e.clientY); }}
      onMouseLeave={hideTooltip}
      className="relative w-full overflow-hidden bg-blue-50"
      style={{ height }}
    >

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

      {/* Transparent overlay above the SVG object — captures mouse position
          pointer-events: none so the SVG library still receives hover events,
          but we track mouse via the wrapper onMouseMove below */}
      {status === "ready" && (
        <div
          onMouseMove={onOverlayMouseMove}
          onMouseLeave={onOverlayMouseLeave}
          className="absolute inset-0"
          style={{ zIndex: 20, background: "transparent", pointerEvents: "none" }}
        />
      )}

      {/* Tooltip — direct DOM manipulation, no re-renders */}
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          transform: "translate(-50%, -100%)",
          pointerEvents: "none",
          zIndex: 30,
          background: "#1e3a8a",
          color: "white",
          fontSize: "12px",
          fontWeight: "700",
          padding: "3px 8px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          whiteSpace: "nowrap",
        }}
      />
    </div>
  );
};

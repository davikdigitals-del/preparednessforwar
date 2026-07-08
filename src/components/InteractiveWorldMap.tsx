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

  useEffect(() => {
    let cancelled = false;

    // Move the tooltip DOM node directly — no React state, no re-render lag
    const showTooltip = (name: string, x: number, y: number) => {
      if (!tooltipRef.current || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const relX = x - rect.left;
      const relY = y - rect.top;
      tooltipRef.current.textContent = name;
      tooltipRef.current.style.left = `${relX}px`;
      tooltipRef.current.style.top = `${relY - 14}px`;
      tooltipRef.current.style.display = "block";
    };

    const hideTooltip = () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
      activeNameRef.current = null;
    };

    // Track real mouse position via wrapper mousemove (React handler)
    // This fires from the parent document whenever mouse is outside the object
    const onWrapperMouseMove = (e: MouseEvent) => {
      if (activeNameRef.current && wrapperRef.current) {
        showTooltip(activeNameRef.current, e.clientX, e.clientY);
      }
    };

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

          activeNameRef.current = name;

          // Try to get position from inner SVG doc
          const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          if (svgObj) {
            try {
              const innerDoc = svgObj.contentDocument;
              if (innerDoc) {
                // Get the last known mouse position from the inner document
                const rect = svgObj.getBoundingClientRect();
                const wRect = wrapperRef.current?.getBoundingClientRect();
                if (wRect) {
                  // Use center of the SVG object as fallback position
                  showTooltip(name, rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
              }
            } catch (_) {}
          }
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

            // Attach mousemove inside the SVG object's own document
            const attachInner = () => {
              try {
                const innerDoc = svgObj.contentDocument;
                if (!innerDoc) return;

                innerDoc.addEventListener("mousemove", (e: MouseEvent) => {
                  if (!activeNameRef.current) return;
                  const rect = svgObj.getBoundingClientRect();
                  // Convert inner coords to screen coords
                  showTooltip(activeNameRef.current, rect.left + e.clientX, rect.top + e.clientY);
                });

                innerDoc.addEventListener("mouseleave", hideTooltip);
              } catch (_) {}
            };

            if (svgObj.contentDocument) {
              attachInner();
            } else {
              svgObj.addEventListener("load", attachInner);
            }
          }

          // Wrapper mousemove as backup
          wrapperRef.current.addEventListener("mousemove", onWrapperMouseMove);
          wrapperRef.current.addEventListener("mouseleave", hideTooltip);
        }

        setStatus("ready");
      } catch (err: any) {
        if (!cancelled) { setErrorMsg(err?.message || "Failed to load map"); setStatus("error"); }
      }
    };

    init();

    return () => {
      cancelled = true;
      wrapperRef.current?.removeEventListener("mousemove", onWrapperMouseMove);
      wrapperRef.current?.removeEventListener("mouseleave", hideTooltip);
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

      {/* Tooltip — plain DOM div, moved directly without React state */}
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          transform: "translate(-50%, -100%)",
          pointerEvents: "none",
          zIndex: 9999,
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

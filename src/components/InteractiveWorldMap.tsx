import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
  height?: string;
  highlightCountry?: string;
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
  highlightCountry,
}: InteractiveWorldMapProps) => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeNameRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const showTooltipAt = (name: string, clientX: number, clientY: number) => {
    if (!tooltipRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    tooltipRef.current.textContent = name;
    tooltipRef.current.style.left = `${clientX - rect.left + 14}px`;
    tooltipRef.current.style.top = `${clientY - rect.top - 10}px`;
    tooltipRef.current.style.display = "block";
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
    activeNameRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;

    const onWindowMouseMove = (e: MouseEvent) => {
      if (activeNameRef.current) showTooltipAt(activeNameRef.current, e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onWindowMouseMove);

    const init = async () => {
      try {
        console.log('🗺️ Loading map script...');
        await loadScript(SCRIPT_SRC);
        if (cancelled) return;

        const mapFn = (window as any).svgWorldMap;
        console.log('🗺️ Map function available:', typeof mapFn);
        if (typeof mapFn !== "function") {
          console.error('❌ svgWorldMap function not found');
          throw new Error("svgWorldMap not available");
        }

        const ts = Date.now();
        const clickCb = `_mapClick_${ts}`;
        const overCb = `_mapOver_${ts}`;
        const outCb = `_mapOut_${ts}`;

        (window as any)[clickCb] = (data: any) => {
          if (!data) return;
          const code = (data.country?.id || (data.id?.length === 2 ? data.id : null) || "").toLowerCase();
          if (!code || code === "ocean" || code === "world") return;
          if (onCountryClick) onCountryClick(code);
          else navigate(`/countries/${code}`);
        };

        (window as any)[overCb] = (data: any) => {
          if (!data) return;
          const name = data.country?.name || (data.id?.length === 2 ? data.name || data.id.toUpperCase() : "");
          const code = data.country?.id || data.id || "";
          if (!name || name === "Ocean" || name === "World" || /^path\d+/i.test(name)) return;
          if (code.toLowerCase() === "ocean" || code.toLowerCase() === "world") return;
          activeNameRef.current = name;
        };

        (window as any)[outCb] = () => hideTooltip();

        // Hide the library's own container while we set it up
        if (!document.getElementById("_map_hide_style")) {
          const style = document.createElement("style");
          style.id = "_map_hide_style";
          style.textContent = `body > #svg-world-map-container { visibility: hidden !important; position: fixed !important; top: -9999px !important; }`;
          document.head.appendChild(style);
        }

        // Remove any stale container
        const staleContainer = document.getElementById("svg-world-map-container");
        if (staleContainer) staleContainer.remove();

        // Call the library — it's synchronous, creates a container + <object> in the DOM
        mapFn({
          libPath: "/svg-world-map/",
          bigMap: false,
          showOcean: true,
          showAntarctica: false,
          showLabels: false,
          showMicroLabels: false,
          showMicroStates: true,
          showInfoBox: false,
          oceanColor: "#dbeafe",
          worldColor: highlightCountry ? "#cbd5e1" : "#e2e8f0",
          countryStroke: { out: "#94a3b8", over: "#1e40af", click: "#1e3a8a" },
          mapClick: clickCb,
          mapOver: overCb,
          mapOut: outCb,
        });

        if (cancelled) return;

        // The library creates #svg-world-map-container synchronously
        // but the <object> inside loads asynchronously — wait for it
        const waitForContainer = () => {
          return new Promise<void>((resolve) => {
            let attempts = 0;
            const check = () => {
              const container = document.getElementById("svg-world-map-container");
              const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
              if (container && svgObj) {
                resolve();
              } else if (attempts++ < 50) {
                setTimeout(check, 100);
              } else {
                resolve(); // Give up after 5 seconds, try anyway
              }
            };
            check();
          });
        };

        await waitForContainer();
        if (cancelled) return;

        const libContainer = document.getElementById("svg-world-map-container");
        const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;

        if (libContainer && wrapperRef.current) {
          wrapperRef.current.appendChild(libContainer);
          libContainer.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;margin:0;padding:0;visibility:visible;";

          if (svgObj) {
            svgObj.style.cssText = "width:100%;height:100%;display:block;border:none;";

            const attachInnerListener = () => {
              try {
                const innerDoc = svgObj.contentDocument;
                if (!innerDoc) return;
                innerDoc.addEventListener("mousemove", (e: MouseEvent) => {
                  if (!activeNameRef.current) return;
                  const objRect = svgObj.getBoundingClientRect();
                  showTooltipAt(activeNameRef.current, objRect.left + e.clientX, objRect.top + e.clientY);
                });
                innerDoc.addEventListener("mouseleave", () => hideTooltip());
              } catch (_) { }
            };

            // Apply highlight
            if (highlightCountry) {
              const applyHighlight = () => {
                try {
                  const innerDoc = svgObj.contentDocument;
                  if (!innerDoc) return;
                  const code = highlightCountry.toLowerCase();
                  [code, code.toUpperCase()].forEach(id => {
                    const el = innerDoc.getElementById(id);
                    if (!el) return;
                    el.querySelectorAll("path, polygon, circle").forEach(p => {
                      (p as SVGElement).style.fill = "#1d4ed8";
                    });
                  });
                } catch (_) { }
              };
              svgObj.addEventListener("load", applyHighlight);
              setTimeout(applyHighlight, 500);
              setTimeout(applyHighlight, 1500);
            }

            attachInnerListener();
            svgObj.addEventListener("load", attachInnerListener);
          }

          setStatus("ready");
        } else {
          throw new Error("Map container not found after waiting");
        }

      } catch (err: any) {
        console.error("🗺️ Map error:", err);
        if (!cancelled) setStatus("error");
      }
    };

    init();

    return () => {
      cancelled = true;
      window.removeEventListener("mousemove", onWindowMouseMove);
      const libContainer = document.getElementById("svg-world-map-container");
      if (libContainer) {
        libContainer.style.display = "none";
        document.body.appendChild(libContainer);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full overflow-hidden bg-blue-50" style={{ height }}>
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading world map…</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
          <p className="text-sm text-gray-500 mb-3">Map unavailable</p>
          <button
            onClick={() => { setStatus("loading"); window.location.reload(); }}
            className="px-4 py-2 text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors rounded"
          >
            Retry
          </button>
        </div>
      )}

      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          pointerEvents: "none",
          zIndex: 30,
          background: "#1e3a8a",
          color: "white",
          fontSize: "12px",
          fontWeight: "700",
          padding: "4px 10px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
          whiteSpace: "nowrap",
        }}
      />
    </div>
  );
};

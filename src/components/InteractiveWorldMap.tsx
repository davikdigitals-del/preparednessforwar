import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
  height?: string;
  highlightCountry?: string; // ISO 2-letter code e.g. "FR"
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
  const [errorMsg, setErrorMsg] = useState("");

  // Position tooltip directly at the mouse cursor
  const showTooltipAt = (name: string, clientX: number, clientY: number) => {
    if (!tooltipRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    tooltipRef.current.textContent = name;
    tooltipRef.current.style.left = `${clientX - rect.left + 14}px`;
    tooltipRef.current.style.top  = `${clientY - rect.top  - 10}px`;
    tooltipRef.current.style.display = "block";
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
    activeNameRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    // Shorter timeout - 5 seconds instead of 10
    timeoutId = setTimeout(() => {
      if (!cancelled && status === "loading") {
        setErrorMsg("Map loading timed out - using fallback");
        setStatus("error");
      }
    }, 5000);

    // Global mousemove — fires even when pointer is over the <object>/SVG iframe.
    // We use this to keep the tooltip glued to the real cursor position.
    const onWindowMouseMove = (e: MouseEvent) => {
      if (activeNameRef.current) {
        showTooltipAt(activeNameRef.current, e.clientX, e.clientY);
      }
    };
    window.addEventListener("mousemove", onWindowMouseMove);

    const init = async () => {
      try {
        console.log("🗺️ Loading SVG world map script...");
        await loadScript(SCRIPT_SRC);
        if (cancelled) return;

        console.log("🗺️ Script loaded, initializing map...");
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
          // Set active name — the window mousemove handler will position and show it
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
        if (typeof mapFn !== "function") {
          throw new Error("svgWorldMap function not found after loading script");
        }

        console.log("🗺️ Calling svgWorldMap function...");
        // Build country colors — highlight the target, dim everything else
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
          worldColor: highlightCountry ? "#cbd5e1" : "#e2e8f0",
          countryStroke: { out: "#94a3b8", over: "#1e40af", click: "#1e3a8a" },
          mapClick: clickCb,
          mapOver:  overCb,
          mapOut:   outCb,
        });

        if (cancelled) return;
        console.log("🗺️ Map initialized, setting up DOM...");

        // Highlight the target country directly in the SVG DOM
        if (highlightCountry) {
          const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          const applyHighlight = () => {
            try {
              const innerDoc = svgObj?.contentDocument;
              if (!innerDoc) return;
              const code = highlightCountry.toLowerCase();
              // The SVG uses group IDs matching the 2-letter country code
              const targets = [
                innerDoc.getElementById(code),
                innerDoc.getElementById(code.toUpperCase()),
                innerDoc.querySelector(`[id="${code}"]`),
                innerDoc.querySelector(`[id="${code.toUpperCase()}"]`),
              ].filter(Boolean);
              targets.forEach(el => {
                if (!el) return;
                // Fill all child paths with highlight blue
                el.querySelectorAll("path, polygon, circle").forEach(p => {
                  (p as SVGElement).style.fill = "#1d4ed8";
                  (p as SVGElement).style.stroke = "#1e3a8a";
                  (p as SVGElement).style.strokeWidth = "1";
                });
                // Also try setting fill directly on the element
                (el as SVGElement).style.fill = "#1d4ed8";
              });
            } catch (_) {
              // cross-origin or not ready — silently ignore
            }
          };

          // Try immediately and also on SVG object load
          const svgObjEl = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          if (svgObjEl) {
            applyHighlight();
            svgObjEl.addEventListener("load", applyHighlight);
            // Retry a few times as the SVG may not be fully parsed yet
            setTimeout(applyHighlight, 300);
            setTimeout(applyHighlight, 800);
            setTimeout(applyHighlight, 1500);
          }
        }

        if (cancelled) return;

        const libContainer = document.getElementById("svg-world-map-container");
        if (libContainer && wrapperRef.current) {
          wrapperRef.current.appendChild(libContainer);
          libContainer.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;margin:0;padding:0;visibility:visible;";
          const svgObj = document.getElementById("svg-world-map") as HTMLObjectElement | null;
          if (svgObj) {
            svgObj.style.cssText = "width:100%;height:100%;display:block;border:none;";

            // The SVG lives inside an <object> which has its own document context.
            // Mouse events inside it don't bubble to window, so we attach a listener
            // directly to the SVG's contentDocument to track cursor position.
            const attachInnerListener = () => {
              try {
                const innerDoc = svgObj.contentDocument;
                if (!innerDoc) return;
                innerDoc.addEventListener("mousemove", (e: MouseEvent) => {
                  if (!activeNameRef.current) return;
                  // e.clientX/Y is relative to the SVG iframe viewport.
                  // Convert to page coords by adding the <object> element's offset.
                  const objRect = svgObj.getBoundingClientRect();
                  const pageX = objRect.left + e.clientX;
                  const pageY = objRect.top  + e.clientY;
                  showTooltipAt(activeNameRef.current, pageX, pageY);
                });
                innerDoc.addEventListener("mouseleave", () => hideTooltip());
              } catch (_) {
                // cross-origin or not ready — silently ignore
              }
            };

            // Try immediately, then on load in case it's not ready yet
            attachInnerListener();
            svgObj.addEventListener("load", attachInnerListener);
          }
        }

        clearTimeout(timeoutId);
        console.log("🗺️ Map setup complete!");
        setStatus("ready");
      } catch (err: any) {
        console.error("🗺️ Map loading error:", err);
        clearTimeout(timeoutId);
        if (!cancelled) { setErrorMsg(err?.message || "Failed to load map"); setStatus("error"); }
      }
    };

    init();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", onWindowMouseMove);
      const libContainer = document.getElementById("svg-world-map-container");
      if (libContainer) {
        libContainer.style.display = "none";
        document.body.appendChild(libContainer);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
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

      {/* Error - Show simple fallback map */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden rounded">
            {/* Simple world map placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-20 bg-blue-300 rounded-lg mb-4 relative">
                  <div className="absolute top-2 left-4 w-6 h-4 bg-blue-500 rounded"></div>
                  <div className="absolute top-4 right-6 w-8 h-3 bg-blue-500 rounded"></div>
                  <div className="absolute bottom-3 left-8 w-5 h-5 bg-blue-500 rounded"></div>
                  <div className="absolute bottom-2 right-4 w-4 h-6 bg-blue-500 rounded"></div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Interactive map unavailable</p>
                <p className="text-xs text-gray-400 mb-4">Showing fallback view</p>
                <button 
                  onClick={() => {
                    setStatus("loading");
                    window.location.reload();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Retry Loading Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip — positioned directly at cursor via window mousemove */}
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

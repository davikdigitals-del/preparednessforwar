import React from "react";

interface State {
  hasError: boolean;
  error: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message || String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#fff",
          fontFamily: "sans-serif",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "#111" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
            The page encountered an error. Please try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === "development" && (
            <pre style={{
              marginTop: 24,
              padding: 12,
              background: "#fee2e2",
              borderRadius: 8,
              fontSize: 11,
              textAlign: "left",
              maxWidth: "100%",
              overflow: "auto",
              color: "#991b1b"
            }}>
              {this.state.error}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

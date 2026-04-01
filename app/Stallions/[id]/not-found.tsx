"use client";

import Link from "next/link";

export default function StallionNotFound() {
  return (
    <div style={{ background: "#f8f7f2", minHeight: "100vh", padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e4e4e4",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "12px", letterSpacing: "0.14em", fontWeight: 800, color: "#999" }}>
            HORSE PROFILE
          </div>
          <h1 style={{ fontSize: "34px", fontWeight: 900, margin: "10px 0 8px", color: "#141414" }}>
            Horse not found
          </h1>
          <p style={{ margin: 0, color: "#666", lineHeight: 1.7, fontSize: "14px" }}>
            This horse may have been removed, or the link is incorrect.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "26px" }}>
            <Link
              href="/allhorses"
              style={{
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: "999px",
                fontWeight: 800,
                fontSize: "13px",
                background: "#8b3d24",
                color: "#fff",
                border: "1px solid #8b3d24",
              }}
            >
              Browse Horses
            </Link>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: "999px",
                fontWeight: 800,
                fontSize: "13px",
                background: "#fff",
                color: "#444",
                border: "1px solid #e4e4e4",
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


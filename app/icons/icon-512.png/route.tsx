import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#0d0e10", color: "#e7a64d", fontFamily: "Arial, sans-serif", fontSize: 288, fontWeight: 900 }}>N</div>,
    { width: 512, height: 512 },
  );
}

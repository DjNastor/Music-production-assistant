import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", borderRadius: 35, backgroundColor: "#0D0E10",
    }}>
      <div style={{ display: "flex", gap: 7, alignItems: "center", justifyContent: "center" }}>
        {[73, 101, 40, 101, 73].map((height, index) => <div key={index} style={{
          width: 13, height, borderRadius: 7,
          backgroundColor: index === 2 ? "#4A4E58" : "#F28C21",
        }}/>)}
      </div>
    </div>,
    size,
  );
}

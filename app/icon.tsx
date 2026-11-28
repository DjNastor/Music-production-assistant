import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
const heights = [210, 290, 116, 290, 210];

export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", borderRadius: 100, backgroundColor: "#0D0E10",
    }}>
      <div style={{ display: "flex", gap: 19, alignItems: "center", justifyContent: "center" }}>
        {heights.map((height, index) => <div key={index} style={{
          width: 37, height, borderRadius: 18,
          backgroundColor: index === 2 ? "#4A4E58" : "#F28C21",
        }} />)}
      </div>
    </div>,
    size,
  );
}

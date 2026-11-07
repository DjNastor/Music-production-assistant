import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nastor AI Studio",
    short_name: "Nastor Studio",
    description: "A focused music production workspace for beats, chords, project planning, and producer handoffs.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0D0E10",
    theme_color: "#E8BC74",
    categories: ["music", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/brand/nastor-waveform-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}

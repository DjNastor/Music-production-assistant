import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nastor AI Studio",
    short_name: "Nastor Studio",
    description: "Music production, sample references and producer projects.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d0e10",
    theme_color: "#0d0e10",
    categories: ["music", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

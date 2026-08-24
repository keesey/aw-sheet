import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shim Sham — Character Sheet",
    short_name: "Shim Sham",
    description: "Interactive character sheet for Jenluwess Wivvashimmeh",
    start_url: "/shim-sham",
    display: "standalone",
    orientation: "landscape",
    background_color: "#0f1419",
    theme_color: "#0f1419",
  };
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nastor AI Studio",
  description: "An AI-powered music production workspace.",
  icons: {
    icon: "/brand/nastor-copilot-mark.svg",
    apple: "/brand/nastor-waveform-mark.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

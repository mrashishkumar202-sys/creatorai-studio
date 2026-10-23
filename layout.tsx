import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorAI Studio — Create your next video",
  description: "Plan Hindi stories, YouTube titles, cinematic 3D prompts and scene-by-scene videos with CreatorAI Studio.",
  openGraph: {
    title: "CreatorAI Studio",
    description: "Your creative workspace for YouTube stories and video planning.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

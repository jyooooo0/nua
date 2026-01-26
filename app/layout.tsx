import type { Metadata } from "next";
import { Cormorant_Garamond, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

const zen = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-zen",
});

export const metadata: Metadata = {
  title: "nua | hair salon",
  description: "静かに、丁寧に、髪と心を整える場所",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cormorant.variable} ${zen.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-accent/30">
        {children}
      </body>
    </html>
  );
}

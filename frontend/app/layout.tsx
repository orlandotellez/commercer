import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/context/CardContext";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"], // importante si quieres bold
  variable: "--font-rajdhani",
});

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commercer",
  description: "componentes de hardware de alta calidad para tu pc. procesadores, tarjetas gráficas, memorias ram, almacenamiento y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

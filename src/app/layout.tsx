import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "La Cosecha de Luz - Minimarket Fresco en Cartagena",
  description: "Frutas, verduras, tubérculos y minimarket directo a tu conjunto residencial en Cartagena (Parque Heredia, La Carolina, Ciudad Jardín). Pedidos rápidos con entrega a tu puerta.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La Cosecha",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full bg-stone-50 text-stone-900 antialiased selection:bg-emerald-500 selection:text-white">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-stone-50">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}

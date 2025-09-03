import type React from "react";
import type { Metadata } from "next";
import { Cambay } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/provider";

const cambay = Cambay({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Admin Portal - Business Management",
  description: "Mobile PWA for business administration and management",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Admin Portal",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Admin Portal",
    title: "Admin Portal - Business Management",
    description: "Mobile PWA for business administration and management",
  },
  twitter: {
    card: "summary",
    title: "Admin Portal - Business Management",
    description: "Mobile PWA for business administration and management",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Admin Portal" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512.png"
        />
      </head>
      <body className={`font-sans ${cambay.className}`}>
        <ReactQueryProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[SW] Registration successful: ', registration.scope);
                    }, function(err) {
                      console.log('[SW] Registration failed: ', err);
                    });
                });
              }
            `,
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}

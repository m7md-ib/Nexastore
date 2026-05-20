"use client";
import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NexaStore — Premium Shopping</title>
        <meta
          name="description"
          content="NexaStore – your destination for premium products at great prices."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}
      >
        {mounted && (
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-color)",
                borderRadius: "12px",
                border: "1px solid var(--toast-border)",
              },
            }}
          />
        )}
        {children}
      </body>
    </html>
  );
}

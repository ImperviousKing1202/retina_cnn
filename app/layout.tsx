import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/offline-status";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RETINA - AI-Powered Retinal Disease Detection",
  description: "Advanced AI-powered retinal disease detection system with CNN technology. Analyze retinal images for glaucoma, diabetic retinopathy, and cataracts using deep learning.",
  keywords: ["RETINA", "retinal disease", "glaucoma detection", "diabetic retinopathy", "cataract detection", "CNN", "deep learning", "medical AI", "ophthalmology", "eye health"],
  authors: [{ name: "RETINA AI Team" }],
  icons: {
    icon: "/retina.png",
    apple: "/retina.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RETINA",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "RETINA - AI-Powered Retinal Disease Detection",
    description: "Advanced AI-powered retinal disease detection system with CNN technology",
    url: "/",
    siteName: "RETINA",
    type: "website",
    images: [
      {
        url: "/retina.png",
        width: 1024,
        height: 1024,
        alt: "RETINA AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RETINA - AI-Powered Retinal Disease Detection",
    description: "Advanced AI-powered retinal disease detection system with CNN technology",
    images: ["/retina.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RETINA" />
        <meta name="application-name" content="RETINA" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/retina.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/retina.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/retina.png" />
        <link rel="mask-icon" href="/retina.png" color="#10b981" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <OfflineIndicator />
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
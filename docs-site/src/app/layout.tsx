import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "create-modern-mern-app | Official Documentation & Architecture Guide",
  description:
    "Interactive CLI generator for production-ready MERN stack applications with React 19, Express 5, MongoDB, Vite, and shadcn/ui.",
  keywords: [
    "create-modern-mern-app",
    "MERN stack",
    "React 19",
    "Express 5",
    "MongoDB",
    "Vite",
    "shadcn/ui",
    "TypeScript MERN",
    "Next-gen CLI",
    "MERN boilerplate",
  ],
  authors: [{ name: "Muhammad Arsalan Warsi" }],
  creator: "Muhammad Arsalan Warsi",
  publisher: "Muhammad Arsalan Warsi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://create-modern-mern-app.vercel.app",
    title: "create-modern-mern-app | Official Documentation",
    description:
      "Production-grade MERN architecture engineered for velocity. React 19, Express 5, MongoDB, and shadcn/ui.",
    siteName: "create-modern-mern-app Docs",
  },
  twitter: {
    card: "summary_large_image",
    title: "create-modern-mern-app | Documentation",
    description: "Production-grade MERN architecture engineered for velocity.",
    creator: "@MArsalanwarsi",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "create-modern-mern-app",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Cross-platform (Windows, macOS, Linux)",
      "description":
        "Interactive npm CLI generator for production-ready MERN stack apps with Vite, React 19, Express 5, and MongoDB.",
      "softwareVersion": "3.0.7",
      "license": "https://opensource.org/licenses/MIT",
      "author": {
        "@type": "Person",
        "name": "Muhammad Arsalan Warsi",
        "url": "https://github.com/MArsalanwarsi"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "TechArticle",
      "headline": "Official Documentation for create-modern-mern-app",
      "description": "Complete setup instructions, model definitions, authentication flow, and sliced layout architecture.",
      "author": {
        "@type": "Person",
        "name": "Muhammad Arsalan Warsi"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

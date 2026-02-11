import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { SidebarWrapper } from "@/components/SidebarWrapper";

export const metadata: Metadata = {
  title: "SEO Writer - כתיבת מאמרי SEO",
  description: "מערכת לכתיבת מאמרי SEO באמצעות בינה מלאכותית",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-heebo bg-[#0a0a0a] text-white antialiased">
        <div className="flex h-screen overflow-hidden">
          <SidebarWrapper />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            className: "rtl font-heebo",
          }}
          richColors
        />
      </body>
    </html>
  );
}

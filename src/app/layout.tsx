import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

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
      <body className="font-heebo bg-[#0a0a0a] text-white min-h-screen antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
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

function Sidebar() {
  return (
    <aside className="w-64 bg-black border-l border-[#222] p-4 flex flex-col gap-1 shrink-0">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-[#C8FF00] text-black w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm">a</span>
          <span>SEO Writer</span>
        </h1>
        <p className="text-xs text-[#9ca3af] mt-1">מערכת כתיבת מאמרים</p>
      </div>
      <NavLink href="/" label="דשבורד" icon="📊" />
      <NavLink href="/articles/new" label="מאמר חדש" icon="➕" />
      <NavLink href="/articles" label="מאמרים" icon="📝" />
      <NavLink href="/categories" label="קטגוריות" icon="📁" />
      <NavLink href="/settings" label="הגדרות" icon="⚙️" />
    </aside>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca3af] hover:bg-[#111] hover:text-[#C8FF00] transition-colors text-sm"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

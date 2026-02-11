import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Writer - כתיבת מאמרי SEO",
  description: "מערכת לכתיבת מאמרי SEO באמצעות בינה מלאכותית",
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
      <body className="font-heebo bg-gray-950 text-gray-100 min-h-screen antialiased">
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
    <aside className="w-64 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-2 shrink-0">
      <div className="mb-6 px-2">
        <h1 className="text-xl font-bold text-indigo-400">✍️ SEO Writer</h1>
        <p className="text-xs text-gray-500 mt-1">מערכת כתיבת מאמרים</p>
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
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

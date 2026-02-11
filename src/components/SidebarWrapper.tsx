'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'דשבורד', icon: '📊', exact: true },
  { href: '/articles/new', label: 'מאמר חדש', icon: '➕', exact: true },
  { href: '/articles', label: 'מאמרים', icon: '📝', exact: false },
  { href: '/categories', label: 'קטגוריות', icon: '📁', exact: false },
  { href: '/settings', label: 'הגדרות', icon: '⚙️', exact: true },
]

export function SidebarWrapper() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Special case: /articles/new should not highlight /articles
  const getActive = (href: string, exact: boolean) => {
    if (href === '/articles' && pathname === '/articles/new') return false
    return isActive(href, exact)
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 md:hidden bg-[#111] border border-[#333] rounded-lg p-2 text-white"
        aria-label="תפריט"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-black border-l border-[#222] p-4 flex flex-col gap-1 shrink-0 h-screen
        fixed md:static z-40 transition-transform duration-200
        ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-[#C8FF00] text-black w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm">a</span>
            <span>SEO Writer</span>
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">מערכת כתיבת מאמרים</p>
        </div>
        {NAV_ITEMS.map(item => {
          const active = getActive(item.href, item.exact)
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20'
                  : 'text-[#9ca3af] hover:bg-[#111] hover:text-[#C8FF00] border border-transparent'
              }`}
            >
              <span>{item.icon}</span>
              <span className={active ? 'font-semibold' : ''}>{item.label}</span>
            </a>
          )
        })}
      </aside>
    </>
  )
}

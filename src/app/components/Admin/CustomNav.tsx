'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation, useAuth } from '@payloadcms/ui'
import { LayoutDashboard, UserCog, Bell, Settings, LogOut, ChevronLeft, ShieldCheck, ShieldOff } from 'lucide-react'

import { useAppIcon } from '@/app/components/Misc/useAppIcon'
import { useAppTitle } from '@/app/components/Misc/useAppTitle'
import { isStaffRole } from '@/lib/auth/roles'
import type { User } from '@/payload-types'

const NAV_ITEMS = [
  {
    href: '/admin',
    label: { hu: 'Irányítópult', en: 'Dashboard' },
    icon: LayoutDashboard,
    section: 'main',
  },
  {
    href: '/admin/collections/users',
    label: { hu: 'Felhasználók', en: 'Users' },
    icon: UserCog,
    section: 'main',
    slug: 'users',
  },
  {
    href: '/admin/collections/notifications',
    label: { hu: 'Értesítések', en: 'Notifications' },
    icon: Bell,
    section: 'main',
    slug: 'notifications',
    showCount: true,
    staffOnly: true,
  },
  {
    href: '/admin/globals/app-settings',
    label: { hu: 'Beállítások', en: 'Settings' },
    icon: Settings,
    section: 'manage',
  },
]

const COUNTS_CACHE_KEY = 'nav-counts'
const COUNTS_CACHE_TTL_MS = 60 * 1000

const loadCachedCounts = (): Record<string, number> | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(COUNTS_CACHE_KEY)
    if (!raw) return null
    const { timestamp, data } = JSON.parse(raw) as {
      timestamp: number
      data: Record<string, number>
    }
    if (!timestamp || Date.now() - timestamp > COUNTS_CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

const saveCachedCounts = (data: Record<string, number>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COUNTS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
  } catch {
    // Best-effort cache; ignore write failures
  }
}

export default function CustomNav() {
  const pathname = usePathname()
  const { i18n } = useTranslation()
  const lang = (i18n?.language as 'hu' | 'en') || 'hu'
  const { src: iconSrc, alt: iconAlt } = useAppIcon()
  const appTitle = useAppTitle()
  const { user } = useAuth()
  const userRole = (user as User | null)?.role

  const getIsMobile = () =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false

  const [isMobile, setIsMobile] = useState(getIsMobile)
  const [collapsed, setCollapsed] = useState(() => (getIsMobile() ? true : false))
  const [counts, setCounts] = useState<Record<string, number>>({})

  const visibleItems = NAV_ITEMS.filter(
    (i) => !i.staffOnly || isStaffRole(userRole),
  )
  const mainItems = visibleItems.filter((i) => i.section === 'main')
  const manageItems = visibleItems.filter((i) => i.section === 'manage')

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/'
    return pathname?.startsWith(href)
  }

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const applyState = (matches: boolean) => {
      setIsMobile(matches)
      if (matches) setCollapsed(true)
    }

    applyState(mql.matches)
    const listener = (event: MediaQueryListEvent) => applyState(event.matches)
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [])

  useEffect(() => {
    if (!isStaffRole(userRole)) return

    const cached = loadCachedCounts()
    if (cached) setCounts(cached)

    const fetchCounts = async () => {
      try {
        const res = await fetch(
          `/api/notifications?limit=0&where[read][equals]=false`,
          { credentials: 'include' },
        )
        const data = await res.json()
        const results = { notifications: data?.totalDocs ?? 0 }
        setCounts(results)
        saveCachedCounts(results)
      } catch {
        // Counts are best-effort; silent failure is fine
      }
    }
    fetchCounts()
  }, [userRole])

  const sidebarCollapsed = isMobile || collapsed

  return (
    <aside
      className={`crm-sidebar ${sidebarCollapsed ? 'crm-sidebar--collapsed' : ''}`}
      id="crm-sidebar"
    >
      {!isMobile && (
        <button
          type="button"
          className="crm-sidebar__collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={lang === 'hu' ? 'Sidebar összecsukása' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-[18px] h-[18px]" />
        </button>
      )}

      <Link href="/admin" className="crm-sidebar__brand">
        <div className="crm-sidebar__logo">
          <Image
            src={iconSrc}
            width={38}
            height={38}
            alt={iconAlt || 'App icon'}
            className="rounded-[var(--radius-sm)] object-cover"
          />
        </div>
        <span className="crm-sidebar__brand-text">{appTitle}</span>
      </Link>

      <div className="crm-sidebar__section-label">{lang === 'hu' ? 'Főmenü' : 'Main Menu'}</div>
      <nav className="crm-sidebar__nav">
        {mainItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const count = item.slug && item.showCount ? counts[item.slug] : undefined
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`crm-sidebar__link ${active ? 'crm-sidebar__link--active' : ''}`}
            >
              <Icon className="crm-sidebar__link-icon" />
              <span className="crm-sidebar__link-label">{item.label[lang]}</span>
              {count !== undefined && count > 0 && (
                <span className="crm-sidebar__badge">{count}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="crm-sidebar__section-label">{lang === 'hu' ? 'Kezelés' : 'Management'}</div>
      <nav className="crm-sidebar__nav">
        {manageItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`crm-sidebar__link ${active ? 'crm-sidebar__link--active' : ''}`}
            >
              <Icon className="crm-sidebar__link-icon" />
              <span className="crm-sidebar__link-label">{item.label[lang]}</span>
            </Link>
          )
        })}
      </nav>

      <div className="crm-sidebar__footer">
        {/* User card */}
        <Link
          href="/account/2fa"
          className="crm-sidebar__link"
          title={lang === 'hu' ? 'Fiók beállítások' : 'Account settings'}
        >
          {(user as User | null)?.twoFactorEnabled ? (
            <ShieldCheck className="crm-sidebar__link-icon shrink-0 text-green-400" />
          ) : (
            <ShieldOff className="crm-sidebar__link-icon shrink-0" />
          )}
          <span className="crm-sidebar__link-label flex flex-col leading-tight overflow-hidden">
            <span className="truncate text-sm font-medium">
              {(user as User | null)?.firstName} {(user as User | null)?.lastName}
            </span>
            <span className="truncate text-xs opacity-50">
              {(user as User | null)?.twoFactorEnabled
                ? lang === 'hu' ? '2FA bekapcsolva' : '2FA enabled'
                : lang === 'hu' ? '2FA kikapcsolva' : '2FA disabled'}
            </span>
          </span>
        </Link>

        <Link href="/admin/logout" className="crm-sidebar__link crm-sidebar__link--logout">
          <LogOut className="crm-sidebar__link-icon" />
          <span className="crm-sidebar__link-label">
            {lang === 'hu' ? 'Kijelentkezés' : 'Log out'}
          </span>
        </Link>
      </div>
    </aside>
  )
}

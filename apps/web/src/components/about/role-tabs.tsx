'use client'

import { Tabs } from '@heroui/react'
import { formatRupiah } from '@repo/i18n'
import {
  BadgeCheck,
  Check,
  CloudCheck,
  GraduationCap,
  HandHelping,
  Landmark,
  MapPin,
  ShoppingBag,
  Store,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { ABOUT_REGENCIES } from './about-facts'

const ROLES = ['buyer', 'owner', 'assistant', 'admin', 'hima'] as const
type Role = (typeof ROLES)[number]

const ICONS: Record<Role, LucideIcon> = {
  buyer: ShoppingBag,
  owner: Store,
  assistant: HandHelping,
  admin: Landmark,
  hima: GraduationCap,
}

const frame = 'bg-surface rounded-(--radius) p-4 border-line border sm:p-5'

/**
 * "One platform, five roles" (PLAN-about-page §3.3, section 4), laid out like a product tour: one row of
 * role pills, then a single stage with the role's steps and a drawing of the screen it uses, built from
 * the same tokens as the real components. Flows follow docs/product/user-flows.md.
 */
export function RoleTabs({
  product,
}: {
  product: {
    name: string
    businessName: string
    villageName: string
    price: number
    imageUrl: string | null
  }
}) {
  const t = useTranslations('about.roles')

  return (
    <Tabs className="w-full">
      <Tabs.ListContainer className="-mx-4 overflow-x-auto bg-transparent px-4 sm:mx-0 sm:px-0">
        <Tabs.List
          aria-label={t('tabsLabel')}
          className="bg-wash/50 border-line w-max min-w-full gap-1 rounded-full border p-1.5"
        >
          {ROLES.map((role) => {
            const Icon = ICONS[role]
            return (
              <Tabs.Tab
                key={role}
                id={role}
                className="text-foreground/75 hover:text-foreground min-h-11 gap-2 rounded-full px-4 font-semibold whitespace-nowrap transition-colors aria-selected:text-white sm:px-5"
              >
                <Icon className="relative z-10 size-[1.125rem] shrink-0" aria-hidden />
                <span className="relative z-10">{t(`${role}.tab`)}</span>
                <Tabs.Indicator className="bg-forest rounded-full shadow-none" />
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs.ListContainer>
      {ROLES.map((role) => (
        <Tabs.Panel key={role} id={role} className="px-0 pt-6 sm:pt-8">
          <div className="bg-wash/50 border-line grid min-h-[26rem] items-center gap-8 rounded-(--radius) border p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:p-14">
            <div className="about-tab-in">
              <h3 className="max-w-[20ch] text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-[2rem]">
                {t(`${role}.title`)}
              </h3>
              <ol className="mt-7 flex flex-col gap-5">
                {(['1', '2', '3'] as const).map((n) => (
                  <li key={n} className="flex gap-4">
                    <span className="bg-surface text-accent border-line grid size-7 shrink-0 place-items-center rounded-full border text-sm font-semibold tabular-nums">
                      {n}
                    </span>
                    <p className="text-foreground/85 pt-0.5 text-[1.0625rem] leading-relaxed">
                      {t(`${role}.steps.${n}`)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div aria-hidden className="about-tab-in flex justify-center [animation-delay:80ms]">
              <div className="w-full max-w-[22rem]">
                <RoleScreen role={role} product={product} />
              </div>
            </div>
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

function RoleScreen({
  role,
  product,
}: {
  role: Role
  product: {
    name: string
    businessName: string
    villageName: string
    price: number
    imageUrl: string | null
  }
}) {
  const t = useTranslations('about.roles.mock')
  const order = useTranslations('order')
  const badge = useTranslations('badge')
  const locale = useLocale() === 'en' ? 'en' : 'id'

  const screens: Record<Role, ReactNode> = {
    buyer: (
      <div className={`${frame} p-0 sm:p-0`}>
        <div className="bg-wash-strong relative aspect-[4/3] overflow-hidden rounded-t-(--radius)">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt="" fill sizes="288px" className="object-cover" />
          ) : null}
        </div>
        <div className="p-3">
          <p className="text-sm leading-snug font-bold">{product.name}</p>
          <p className="text-muted mt-1 flex items-center gap-1 text-xs">
            <MapPin className="size-3.5" />
            {product.villageName}
          </p>
          <p className="text-accent mt-1.5 font-semibold tabular-nums">
            {formatRupiah(product.price, locale)}
          </p>
          <span className="bg-wa mt-3 flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-bold text-white">
            <WhatsAppIcon className="size-4" />
            {order('send')}
          </span>
        </div>
      </div>
    ),
    owner: (
      <div className={frame}>
        <div className="flex items-center gap-3">
          <span className="bg-accent text-accent-foreground grid size-12 place-items-center rounded-full text-lg font-semibold">
            {product.businessName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{product.businessName}</p>
            <p className="text-muted text-xs">{product.villageName}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="bg-accent-soft text-accent-soft-foreground inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-bold">
            <BadgeCheck className="size-4" />
            {badge('verified')}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--success)_14%,white)] px-3 text-xs font-bold text-[color-mix(in_oklab,var(--success)_85%,black)]">
            <span className="size-1.5 rounded-full bg-current" />
            {t('open')}
            <span className="font-medium opacity-80">{t('openDetail')}</span>
          </span>
        </div>
        <p className="text-muted mt-4 text-xs font-bold tracking-wide uppercase">{t('shops')}</p>
        <div className="mt-2 flex gap-2">
          {['Shopee', 'Tokopedia', 'Instagram'].map((shop) => (
            <span
              key={shop}
              className="border-line inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold"
            >
              <Store className="size-3.5" />
              {shop}
            </span>
          ))}
        </div>
      </div>
    ),
    assistant: (
      <div className={frame}>
        <p className="text-muted text-xs font-bold">{t('steps')}</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {(['1', '2', '3', '4'] as const).map((n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full ${n <= '2' ? 'bg-accent' : 'bg-wash-strong'}`}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 text-[0.6875rem] font-semibold">
          {(['1', '2', '3', '4'] as const).map((n) => (
            <span key={n} className={n === '2' ? 'text-accent' : 'text-muted'}>
              {t(`stepNames.${n}`)}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold">{t('whatsapp')}</p>
        <p className="border-line-strong mt-1.5 rounded-(--radius-compact) border px-3 py-2 text-sm tabular-nums">
          0812 3456 7890
        </p>
        <p className="text-success mt-3 flex items-center gap-1.5 text-xs font-bold">
          <CloudCheck className="size-4" />
          {t('saved')}
        </p>
      </div>
    ),
    admin: (
      <div className={frame}>
        <p className="text-muted text-xs font-bold tracking-wide uppercase">{t('queue')}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">Keripik Bu Ani</p>
            <p className="text-muted text-xs">{product.villageName}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <span className="border-line-strong inline-flex h-8 items-center rounded-full border px-3 text-xs font-bold">
              {t('reject')}
            </span>
            <span className="bg-accent text-accent-foreground inline-flex h-8 items-center rounded-full px-3 text-xs font-bold">
              {t('approve')}
            </span>
          </div>
        </div>
        <p className="text-muted mt-4 text-xs font-bold tracking-wide uppercase">
          {t('requirements')}
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          {(['verified', 'consent', 'phone', 'active'] as const).map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span className="bg-accent-soft text-accent grid size-5 place-items-center rounded-full">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {t(`requirement.${key}`)}
            </li>
          ))}
        </ul>
      </div>
    ),
    hima: (
      <div className={frame}>
        <ul className="flex flex-col gap-3">
          {ABOUT_REGENCIES.map((regency) => (
            <li key={regency.name}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold">{regency.name}</span>
                <span className="text-muted text-xs tabular-nums">
                  {regency.villages} {t('villages')}
                </span>
              </div>
              <span className="bg-wash-strong mt-1.5 block h-2 overflow-hidden rounded-full">
                <span
                  className="bg-accent block h-full rounded-full"
                  style={{ width: `${(regency.villages / 13) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    ),
  }

  return screens[role]
}

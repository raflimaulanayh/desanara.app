'use client'

import { Button, Card, Chip } from '@heroui/react'
import { unwrap } from '@repo/api-client'
import { Container } from '@repo/ui/components/container'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'

export function DashboardHome() {
  const t = useTranslations()
  const router = useRouter()
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await unwrap(await api.v1.me.$get())).data,
  })

  useEffect(() => {
    if (me.isError) router.replace('/login')
  }, [me.isError, router])

  if (!me.data) {
    return <Container className="py-16 text-sm">{t('dashboard.loadingSession')}</Container>
  }

  const { user, actor } = me.data
  const roles = [
    ...(actor.globalRole ? [actor.globalRole] : []),
    ...Object.values(actor.villageRoles),
    ...Object.values(actor.businessRoles),
  ]

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome', { name: user.name })}</h1>
        <Button
          variant="secondary"
          onPress={async () => {
            await authClient.signOut()
            router.replace('/login')
          }}
        >
          {t('dashboard.logout')}
        </Button>
      </div>
      <Card>
        <Card.Header>
          <Card.Title>{t('dashboard.roles')}</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <p className="text-muted text-sm">{t('dashboard.noRoles')}</p>
          ) : (
            [...new Set(roles)].map((role) => <Chip key={role}>{t(`roles.${role}`)}</Chip>)
          )}
        </Card.Content>
      </Card>
    </Container>
  )
}

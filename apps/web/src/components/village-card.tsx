import { Card } from '@heroui/react'
import { Link } from '@/i18n/navigation'

export function VillageCard({
  slug,
  name,
  regionName,
  businessLabel,
}: {
  slug: string
  name: string
  regionName: string | null
  businessLabel: string
}) {
  return (
    <Link href={`/villages/${slug}`} className="block focus-visible:outline-none">
      <Card className="h-full transition hover:-translate-y-0.5">
        <Card.Header>
          <Card.Title>{name}</Card.Title>
          {regionName ? <Card.Description>{regionName}</Card.Description> : null}
        </Card.Header>
        <Card.Content>
          <p className="text-muted text-sm">{businessLabel}</p>
        </Card.Content>
      </Card>
    </Link>
  )
}

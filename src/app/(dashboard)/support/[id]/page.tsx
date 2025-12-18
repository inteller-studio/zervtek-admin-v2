import { TicketDetail } from '@/features/support/components/ticket-detail'

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params
  return <TicketDetail ticketId={id} />
}

// app/(protected)/(intranet)/requests/[id]/page.tsx

import { TicketDetailPage } from "@/app/(protected)/(intranet)/requests/[id]/components/TicketDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { id } = await params;
  return <TicketDetailPage ticketId={id} />;
}
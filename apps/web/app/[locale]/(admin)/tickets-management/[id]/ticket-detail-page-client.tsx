"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ticketService } from "@/features/tickets/services/ticketService";
import { ETicketDisplay } from "@/features/tickets/components/ETicketDisplay";
import { useTranslations } from "next-intl";

interface TicketDetailPageClientProps {
  readonly ticketId: string;
}

export function TicketDetailPageClient({
  ticketId,
}: TicketDetailPageClientProps) {
  const router = useRouter();
  const t = useTranslations("tickets");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => ticketService.getETicketById(ticketId),
  });

  const ticket = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("ticketDetail") ?? "Ticket Detail"}
            </h1>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {t("ticketNotFound") ?? "Ticket not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {t("ticketDetail") ?? "Ticket Detail"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ticket.qr_code}
          </p>
        </div>
      </div>

      <ETicketDisplay ticket={ticket} showQRCode={true} />
    </div>
  );
}



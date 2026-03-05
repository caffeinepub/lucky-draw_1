import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Star, Ticket, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Lottery } from "../backend.d";
import { TicketCard } from "../components/TicketCard";
import {
  getOrCreateSessionId,
  useGetAllLotteries,
  useGetTicketsBySession,
  useRecordVisit,
} from "../hooks/useQueries";

export function MyTicketsPage() {
  const sessionId = getOrCreateSessionId();
  const recordVisit = useRecordVisit();
  const {
    data: tickets,
    isLoading: loadingTickets,
    isError: ticketsError,
  } = useGetTicketsBySession(sessionId);
  const { data: lotteries, isLoading: loadingLotteries } = useGetAllLotteries();
  const visitRecorded = useRef(false);

  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;
    recordVisit.mutate("/my-tickets");
  }, [recordVisit]);

  const lotteryMap = new Map<string, Lottery>(
    (lotteries ?? []).map((l) => [l.id.toString(), l]),
  );

  const isLoading = loadingTickets || loadingLotteries;
  const winningTickets = (tickets ?? []).filter((t) => {
    const lottery = lotteryMap.get(t.lotteryId.toString());
    return (
      lottery?.isDrawn &&
      lottery.winningNumber !== undefined &&
      lottery.winningNumber === t.ticketNumber
    );
  });

  return (
    <main className="min-h-screen bg-mesh" data-ocid="my_tickets.page">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg border border-gold/30 bg-gold/10 p-2">
              <Ticket className="h-5 w-5 text-gold" />
            </div>
            <h1 className="font-display text-3xl font-bold">My Tickets</h1>
          </div>
          <p className="text-muted-foreground">
            All tickets purchased in this browser session
          </p>

          {winningTickets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 shadow-gold"
            >
              <Trophy className="h-5 w-5 text-gold flex-shrink-0" />
              <div>
                <p className="text-gold font-semibold">
                  🎉 You have {winningTickets.length} winning{" "}
                  {winningTickets.length === 1 ? "ticket" : "tickets"}!
                </p>
                <p className="text-xs text-muted-foreground">
                  Check the winning numbers below.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="my_tickets.loading_state"
          >
            <Loader2 className="h-10 w-10 text-gold animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              Loading your tickets…
            </p>
          </div>
        )}

        {/* Error */}
        {ticketsError && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="my_tickets.error_state"
          >
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-foreground font-medium">
              Could not load tickets
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !ticketsError && (tickets ?? []).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
            data-ocid="my_tickets.empty_state"
          >
            <div className="relative">
              <div className="rounded-full border-2 border-dashed border-border/60 p-8">
                <Ticket className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <Star className="absolute top-2 right-2 h-4 w-4 text-gold/50 animate-float" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-display text-2xl font-semibold">
                No tickets yet
              </p>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                Visit the homepage to browse active lotteries and purchase your
                first ticket!
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-2 font-mono">
              <span>Session:</span>
              <span className="bg-secondary/50 rounded px-2 py-0.5">
                {sessionId.slice(0, 8)}…
              </span>
            </div>
          </motion.div>
        )}

        {/* Tickets grid */}
        {!isLoading && !ticketsError && (tickets ?? []).length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-border/50 text-muted-foreground"
                >
                  {tickets?.length} ticket
                  {(tickets?.length ?? 0) !== 1 ? "s" : ""}
                </Badge>
                {winningTickets.length > 0 && (
                  <Badge className="bg-gold/15 text-gold border-gold/30">
                    <Trophy className="h-3 w-3 mr-1" />
                    {winningTickets.length} winner
                    {winningTickets.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Session: {sessionId.slice(0, 8)}…
              </div>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-ocid="my_tickets.list"
            >
              {tickets?.map((ticket, index) => (
                <TicketCard
                  key={`${ticket.lotteryId}-${ticket.ticketNumber}`}
                  ticket={ticket}
                  lottery={lotteryMap.get(ticket.lotteryId.toString())}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

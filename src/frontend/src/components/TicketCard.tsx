import { Badge } from "@/components/ui/badge";
import { Hash, Ticket, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { Lottery, Ticket as TicketType } from "../backend.d";
import { formatDrawDate, formatTicketNumber } from "../utils/lottery";

interface TicketCardProps {
  ticket: TicketType;
  lottery: Lottery | undefined;
  index: number;
}

export function TicketCard({ ticket, lottery, index }: TicketCardProps) {
  const isWinner =
    lottery?.isDrawn &&
    lottery.winningNumber !== undefined &&
    lottery.winningNumber === ticket.ticketNumber;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`
        relative overflow-hidden rounded-xl border-2 
        ${
          isWinner
            ? "border-gold/60 bg-gold/5 shadow-gold-lg"
            : "border-border/50 bg-card shadow-ticket"
        }
      `}
      data-ocid={`my_tickets.item.${index + 1}`}
    >
      {/* Winner glow overlay */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 pointer-events-none" />
      )}

      {/* Perforated top edge */}
      <div className="flex justify-around px-4 -mt-1.5 relative z-10">
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
      </div>

      <div className="px-5 py-4">
        {/* Top: ticket number + winner badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Ticket Number
            </p>
            <p
              className={`font-mono text-2xl font-bold tracking-widest ${
                isWinner ? "text-gold" : "text-foreground"
              }`}
            >
              {formatTicketNumber(ticket.ticketNumber)}
            </p>
          </div>

          {isWinner ? (
            <Badge className="bg-gold/20 text-gold border-gold/40 font-bold flex-shrink-0">
              <Trophy className="h-3 w-3 mr-1 fill-current" />
              WINNER!
            </Badge>
          ) : lottery?.isDrawn ? (
            <Badge
              variant="outline"
              className="text-muted-foreground flex-shrink-0"
            >
              Not drawn
            </Badge>
          ) : (
            <Badge className="bg-gold/15 text-gold border-gold/30 flex-shrink-0 text-xs">
              Active
            </Badge>
          )}
        </div>

        {/* Divider with scissors icon */}
        <div className="relative flex items-center gap-2 my-3">
          <div className="flex-1 border-t border-dashed border-border/60" />
          <Ticket className="h-3.5 w-3.5 text-muted-foreground/50 rotate-12" />
          <div className="flex-1 border-t border-dashed border-border/60" />
        </div>

        {/* Lottery info */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Lottery</span>
            <span className="text-foreground font-medium text-right truncate max-w-[60%]">
              {lottery?.name ??
                `#${lottery?.id.toString() ?? ticket.lotteryId.toString()}`}
            </span>
          </div>

          {lottery && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Draw Date</span>
              <span className="text-foreground">
                {formatDrawDate(lottery.drawDate)}
              </span>
            </div>
          )}

          {lottery?.isDrawn && lottery.winningNumber !== undefined && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Winning #</span>
              <span
                className={`font-mono font-bold ${isWinner ? "text-gold" : "text-foreground"}`}
              >
                {formatTicketNumber(lottery.winningNumber)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Perforated bottom edge */}
      <div className="flex justify-around px-4 -mb-1.5 relative z-10">
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
        <span className="h-3 w-3 rounded-full bg-background border border-border/40" />
      </div>
    </motion.article>
  );
}

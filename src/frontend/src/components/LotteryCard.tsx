import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2, Star, Ticket, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { Lottery } from "../backend.d";
import { formatDrawDate, formatPrice, isDrawDatePast } from "../utils/lottery";

interface LotteryCardProps {
  lottery: Lottery;
  index: number;
  onBuy: (lottery: Lottery) => void;
  isBuying: boolean;
  buyingId: bigint | null;
}

export function LotteryCard({
  lottery,
  index,
  onBuy,
  isBuying,
  buyingId,
}: LotteryCardProps) {
  const isThisBuying = isBuying && buyingId === lottery.id;
  const drawDatePast = isDrawDatePast(lottery.drawDate);
  const showDrawn = lottery.isDrawn || (drawDatePast && !lottery.isActive);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-ticket"
      data-ocid={`lottery.item.${index + 1}`}
    >
      {/* Top accent bar with lottery number */}
      <div
        className={`h-1 w-full ${showDrawn ? "bg-muted-foreground/30" : "bg-gradient-to-r from-gold-dim via-gold to-gold-dim"}`}
      />

      {/* Perforated left edge decoration */}
      <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between py-2 pointer-events-none">
        <span className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-background border border-border/60" />
        <span className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-background border border-border/60" />
        <span className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-background border border-border/60" />
        <span className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-background border border-border/60" />
        <span className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-background border border-border/60" />
        <span className="h-1.5 w-1.5 -translate-x-0.5 rounded-full bg-background border border-border/60" />
      </div>

      <div className="px-5 py-4 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate leading-tight group-hover:text-gold transition-colors">
              {lottery.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {lottery.description}
            </p>
          </div>

          {/* Status badge */}
          {showDrawn ? (
            <Badge className="bg-muted/50 text-muted-foreground border-border/50 flex-shrink-0 text-xs">
              Drawn
            </Badge>
          ) : (
            <Badge className="bg-gold/15 text-gold border-gold/30 flex-shrink-0 text-xs font-semibold">
              <Star className="h-2.5 w-2.5 mr-1 fill-current" />
              Active
            </Badge>
          )}
        </div>

        {/* Winning number (if drawn) */}
        {showDrawn && lottery.winningNumber !== undefined && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
            <Trophy className="h-4 w-4 text-gold flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Winning Number</p>
              <p className="font-mono font-bold text-gold text-lg leading-none">
                {String(lottery.winningNumber).padStart(6, "0")}
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 text-gold/70" />
            <span>
              <span className="text-foreground font-semibold">
                {formatPrice(lottery.price)}
              </span>{" "}
              tokens
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-violet/70" />
            <span>
              {showDrawn ? (
                "Drawn"
              ) : (
                <>
                  <span className="hidden sm:inline">Draw: </span>
                  {formatDrawDate(lottery.drawDate)}
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span>Max {Number(lottery.maxTickets).toLocaleString()}</span>
          </div>
        </div>

        {/* CTA */}
        {!showDrawn && lottery.isActive && (
          <Button
            onClick={() => onBuy(lottery)}
            disabled={isThisBuying}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-gold transition-all duration-200"
            data-ocid={`lottery.buy_button.${index + 1}`}
          >
            {isThisBuying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Purchasing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Buy Ticket — {formatPrice(lottery.price)} tokens
              </span>
            )}
          </Button>
        )}

        {showDrawn && (
          <div className="rounded-lg bg-muted/20 px-3 py-2 text-center text-xs text-muted-foreground border border-border/30">
            This lottery has been drawn
          </div>
        )}
      </div>
    </motion.article>
  );
}

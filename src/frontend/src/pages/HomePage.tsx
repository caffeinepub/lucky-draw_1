import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Loader2,
  Search,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Lottery } from "../backend.d";
import { LotteryCard } from "../components/LotteryCard";
import {
  useGetAllLotteries,
  usePurchaseTicket,
  useRecordVisit,
} from "../hooks/useQueries";

export function HomePage() {
  const { data: lotteries, isLoading, isError } = useGetAllLotteries();
  const purchaseMutation = usePurchaseTicket();
  const recordVisit = useRecordVisit();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "drawn">("all");
  const [buyingId, setBuyingId] = useState<bigint | null>(null);
  const visitRecorded = useRef(false);

  // Record visit on mount (once)
  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;
    recordVisit.mutate("/");
  }, [recordVisit]);

  const filtered = (lotteries ?? []).filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && l.isActive && !l.isDrawn) ||
      (filter === "drawn" && l.isDrawn);
    return matchesSearch && matchesFilter;
  });

  const activeLotteries = (lotteries ?? []).filter(
    (l) => l.isActive && !l.isDrawn,
  ).length;

  async function handleBuy(lottery: Lottery) {
    setBuyingId(lottery.id);
    try {
      const ticketNumber = await purchaseMutation.mutateAsync(lottery.id);
      toast.success(
        `Ticket #${String(ticketNumber).padStart(6, "0")} purchased!`,
        {
          description: `You're entered in "${lottery.name}". Good luck!`,
          duration: 5000,
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      toast.error("Could not purchase ticket", { description: message });
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-mesh" data-ocid="home.page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/generated/lottery-hero.dim_1200x400.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gold" />
              <Badge className="bg-gold/15 text-gold border-gold/30 text-xs font-semibold">
                {activeLotteries} Active{" "}
                {activeLotteries === 1 ? "Lottery" : "Lotteries"}
              </Badge>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
              <span className="shimmer-gold">Win Big.</span>
              <br />
              <span className="text-foreground">Play Smart.</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
              Browse active lotteries, buy tickets, and check results — all
              tracked anonymously on-chain.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Search */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary/50 border border-border/40">
            {(["all", "active", "drawn"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                data-ocid="home.filter.tab"
                className={`
                  px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all
                  ${
                    filter === f
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {f === "all" ? "All" : f === "active" ? "Active" : "Drawn"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search lotteries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 bg-secondary/50 border-border/40 text-sm focus-visible:ring-primary/50"
              data-ocid="home.search_input"
            />
          </div>

          <div className="text-xs text-muted-foreground ml-auto">
            {filtered.length} {filtered.length === 1 ? "lottery" : "lotteries"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="home.loading_state"
          >
            <Loader2 className="h-10 w-10 text-gold animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              Loading lotteries…
            </p>
          </div>
        )}

        {isError && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="home.error_state"
          >
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-foreground font-medium">
              Failed to load lotteries
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page.
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="home.empty_state"
          >
            <div className="rounded-full border-2 border-dashed border-border/60 p-6">
              <Trophy className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold text-lg">
                No lotteries found
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? `No results for "${search}"`
                  : "No lotteries available yet. Check back soon!"}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((lottery, index) => (
              <LotteryCard
                key={lottery.id.toString()}
                lottery={lottery}
                index={index}
                onBuy={handleBuy}
                isBuying={purchaseMutation.isPending}
                buyingId={buyingId}
              />
            ))}
          </div>
        )}

        {/* Stats summary */}
        {!isLoading && !isError && (lotteries?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-border/40 pt-8"
          >
            {[
              {
                label: "Active",
                value: activeLotteries,
                color: "text-gold",
                Icon: Star,
              },
              {
                label: "Total",
                value: lotteries?.length ?? 0,
                color: "text-foreground",
                Icon: Trophy,
              },
              {
                label: "Drawn",
                value: (lotteries ?? []).filter((l) => l.isDrawn).length,
                color: "text-muted-foreground",
                Icon: Trophy,
              },
            ].map(({ label, value, color, Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-border/40 bg-card/50 p-4 text-center"
              >
                <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                <p className={`text-2xl font-display font-bold ${color}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}

import { Activity, ChevronDown, ChevronUp, Clock, Eye } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetRecentVisits, useGetTotalVisits } from "../hooks/useQueries";
import {
  formatPageName,
  formatVisitTime,
  shortSession,
} from "../utils/lottery";

export function VisitStatsPanel() {
  const [expanded, setExpanded] = useState(false);
  const { data: totalVisits, isLoading: loadingTotal } = useGetTotalVisits();
  const { data: recentVisits, isLoading: loadingRecent } = useGetRecentVisits(
    BigInt(10),
  );

  return (
    <div
      className="border-t border-border/40 bg-background/60 backdrop-blur-sm"
      data-ocid="visit_stats.panel"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-3">
            <Activity className="h-3.5 w-3.5 text-emerald" />
            <span className="font-medium">Visit Analytics</span>

            {loadingTotal ? (
              <span
                className="h-4 w-16 rounded bg-muted/50 animate-pulse"
                data-ocid="visit_stats.loading_state"
              />
            ) : (
              <span
                className="flex items-center gap-1.5 text-foreground font-semibold"
                data-ocid="visit_stats.total"
              >
                <Eye className="h-3 w-3 text-gold" />
                {Number(totalVisits ?? 0).toLocaleString()} total visits
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground/60">
            <span className="hidden sm:block">Recent activity</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-4">
                {loadingRecent ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-7 rounded bg-muted/30 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (recentVisits?.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No visits recorded yet.
                  </p>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5"
                    data-ocid="visit_stats.list"
                  >
                    {recentVisits?.map((visit) => (
                      <div
                        key={`${visit.sessionId}-${visit.timestamp}`}
                        className="flex items-center justify-between gap-2 rounded px-2.5 py-1.5 bg-secondary/30 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet flex-shrink-0" />
                          <span className="text-foreground font-medium truncate">
                            {formatPageName(visit.page)}
                          </span>
                          <span className="text-muted-foreground/60 truncate font-mono text-[10px] hidden sm:block">
                            {shortSession(visit.sessionId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="whitespace-nowrap">
                            {formatVisitTime(visit.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

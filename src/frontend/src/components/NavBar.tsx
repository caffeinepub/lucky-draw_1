import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star, Ticket, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetTotalVisits } from "../hooks/useQueries";

interface NavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function NavBar({ currentPage, onNavigate }: NavBarProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: totalVisits } = useGetTotalVisits();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const navItems = [
    { path: "/", label: "Lotteries", icon: Star },
    { path: "/my-tickets", label: "My Tickets", icon: Ticket },
    { path: "/admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <motion.button
            onClick={() => onNavigate("/")}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-ocid="nav.link"
          >
            <div className="relative">
              <Trophy
                className="h-7 w-7 text-gold group-hover:text-gold-bright transition-colors"
                strokeWidth={1.5}
              />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight shimmer-gold hidden sm:block">
              Lucky Draw
            </span>
          </motion.button>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  data-ocid={`nav.${item.label.toLowerCase().replace(" ", "_")}.link`}
                  className={`
                    flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }
                  `}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Right side: visits + auth */}
          <div className="flex items-center gap-3">
            {totalVisits !== undefined && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground border border-border/50 rounded-full px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                <span>{Number(totalVisits).toLocaleString()} visits</span>
              </div>
            )}

            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                data-ocid="nav.logout.button"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                data-ocid="nav.login.button"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            )}

            {isLoggedIn && (
              <Badge
                variant="outline"
                className="border-emerald/50 text-emerald text-xs hidden sm:flex"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald mr-1.5" />
                Connected
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import { Heart, Trophy } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border/40 bg-background/60 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-gold" />
            <span className="font-display font-semibold text-foreground">
              Lucky Draw
            </span>
            <span className="text-border">·</span>
            <span>Anonymous on-chain lottery platform</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>© {year}. Built with</span>
            <Heart className="h-3 w-3 text-ruby fill-current" />
            <span>using</span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-bright underline underline-offset-2 transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

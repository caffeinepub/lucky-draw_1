import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { NavBar } from "./components/NavBar";
import { VisitStatsPanel } from "./components/VisitStatsPanel";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { MyTicketsPage } from "./pages/MyTicketsPage";

type Page = "/" | "/my-tickets" | "/admin";

const VALID_PAGES: Page[] = ["/", "/my-tickets", "/admin"];

function getInitialPage(): Page {
  const hash = window.location.hash.replace("#", "") || "/";
  return VALID_PAGES.includes(hash as Page) ? (hash as Page) : "/";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);

  function navigate(page: string) {
    const p = VALID_PAGES.includes(page as Page) ? (page as Page) : "/";
    setCurrentPage(p);
    window.location.hash = p;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace("#", "") || "/";
      const p = VALID_PAGES.includes(hash as Page) ? (hash as Page) : "/";
      setCurrentPage(p);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Update document title per page
  useEffect(() => {
    const titles: Record<Page, string> = {
      "/": "Lucky Draw — Browse Lotteries",
      "/my-tickets": "My Tickets — Lucky Draw",
      "/admin": "Admin Panel — Lucky Draw",
    };
    document.title = titles[currentPage] ?? "Lucky Draw";
  }, [currentPage]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar currentPage={currentPage} onNavigate={navigate} />

      <div className="flex-1">
        {currentPage === "/" && <HomePage />}
        {currentPage === "/my-tickets" && <MyTicketsPage />}
        {currentPage === "/admin" && <AdminPage />}
      </div>

      <VisitStatsPanel />
      <Footer />

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border-border/60 text-foreground shadow-ticket font-sans",
            title: "font-semibold",
            description: "text-muted-foreground",
            success: "border-emerald/40",
            error: "border-destructive/40",
          },
        }}
      />
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Edit3,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Lottery } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateLottery,
  useDeleteLottery,
  useGetAllLotteries,
  useIsCallerAdmin,
  useRecordVisit,
  useUpdateLottery,
} from "../hooks/useQueries";
import { dateToNs, formatDrawDate, formatPrice } from "../utils/lottery";

interface LotteryFormData {
  name: string;
  description: string;
  price: string;
  drawDate: string;
  maxTickets: string;
}

const EMPTY_FORM: LotteryFormData = {
  name: "",
  description: "",
  price: "100",
  drawDate: "",
  maxTickets: "1000",
};

function validateForm(data: LotteryFormData): string | null {
  if (!data.name.trim()) return "Name is required";
  if (!data.description.trim()) return "Description is required";
  const price = Number(data.price);
  if (Number.isNaN(price) || price <= 0)
    return "Price must be a positive number";
  if (!data.drawDate) return "Draw date is required";
  if (new Date(data.drawDate) <= new Date())
    return "Draw date must be in the future";
  const max = Number(data.maxTickets);
  if (Number.isNaN(max) || max <= 0)
    return "Max tickets must be a positive number";
  return null;
}

function LotteryForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  initial: LotteryFormData;
  onSubmit: (data: LotteryFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<LotteryFormData>(initial);

  function set(field: keyof LotteryFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm(form);
    if (err) {
      toast.error(err);
      return;
    }
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.create_lottery.form"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lot-name" className="text-sm">
            Lottery Name
          </Label>
          <Input
            id="lot-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Summer Jackpot"
            className="bg-secondary/50 border-border/50"
            data-ocid="admin.lottery.name.input"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lot-price" className="text-sm">
            Ticket Price (tokens)
          </Label>
          <Input
            id="lot-price"
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="bg-secondary/50 border-border/50"
            data-ocid="admin.lottery.price.input"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lot-desc" className="text-sm">
          Description
        </Label>
        <Textarea
          id="lot-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe this lottery…"
          rows={2}
          className="bg-secondary/50 border-border/50 resize-none"
          data-ocid="admin.lottery.description.textarea"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lot-date" className="text-sm">
            Draw Date
          </Label>
          <Input
            id="lot-date"
            type="datetime-local"
            value={form.drawDate}
            onChange={(e) => set("drawDate", e.target.value)}
            className="bg-secondary/50 border-border/50"
            data-ocid="admin.lottery.draw_date.input"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lot-max" className="text-sm">
            Max Tickets
          </Label>
          <Input
            id="lot-max"
            type="number"
            min="1"
            value={form.maxTickets}
            onChange={(e) => set("maxTickets", e.target.value)}
            className="bg-secondary/50 border-border/50"
            data-ocid="admin.lottery.max_tickets.input"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex-1 sm:flex-none"
          data-ocid="admin.lottery.submit_button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Saving…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border/50"
          data-ocid="admin.lottery.cancel_button"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function formDataFromLottery(lottery: Lottery): LotteryFormData {
  const d = new Date(Number(lottery.drawDate / BigInt(1_000_000)));
  const pad = (n: number) => String(n).padStart(2, "0");
  const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return {
    name: lottery.name,
    description: lottery.description,
    price: String(lottery.price),
    drawDate: local,
    maxTickets: String(lottery.maxTickets),
  };
}

export function AdminPage() {
  const recordVisit = useRecordVisit();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: lotteries, isLoading: lotteriesLoading } = useGetAllLotteries();
  const createMutation = useCreateLottery();
  const updateMutation = useUpdateLottery();
  const deleteMutation = useDeleteLottery();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editLottery, setEditLottery] = useState<Lottery | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lottery | null>(null);

  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const visitRecorded = useRef(false);

  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;
    recordVisit.mutate("/admin");
  }, [recordVisit]);

  async function handleCreate(data: LotteryFormData) {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description,
        price: BigInt(data.price),
        drawDate: dateToNs(new Date(data.drawDate)),
        maxTickets: BigInt(data.maxTickets),
      });
      toast.success("Lottery created successfully!");
      setShowCreateForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Creation failed";
      toast.error("Could not create lottery", { description: message });
    }
  }

  async function handleUpdate(data: LotteryFormData) {
    if (!editLottery) return;
    try {
      await updateMutation.mutateAsync({
        id: editLottery.id,
        name: data.name,
        description: data.description,
        price: BigInt(data.price),
        drawDate: dateToNs(new Date(data.drawDate)),
        maxTickets: BigInt(data.maxTickets),
      });
      toast.success("Lottery updated!");
      setEditLottery(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error("Could not update lottery", { description: message });
    }
  }

  async function handleDelete(lottery: Lottery) {
    try {
      await deleteMutation.mutateAsync(lottery.id);
      toast.success(`"${lottery.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error("Could not delete lottery", { description: message });
    }
  }

  return (
    <main className="min-h-screen bg-mesh" data-ocid="admin.page">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg border border-violet/40 bg-violet/10 p-2">
              <ShieldCheck className="h-5 w-5 text-violet" />
            </div>
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage lotteries and track platform activity
          </p>
        </motion.div>

        {/* Not logged in guard */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border/60 bg-card p-8 text-center max-w-lg mx-auto mt-12"
          >
            <ShieldOff className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">
              Admin Access Required
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Sign in with Internet Identity to access the admin panel. Only
              authorized administrators can manage lotteries.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="admin.login.button"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In to Continue"
              )}
            </Button>
          </motion.div>
        )}

        {/* Admin check loading */}
        {isLoggedIn && adminCheckLoading && (
          <div
            className="flex items-center justify-center py-20 gap-3"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="h-8 w-8 text-violet animate-spin" />
            <p className="text-muted-foreground">Checking permissions…</p>
          </div>
        )}

        {/* Not admin */}
        {isLoggedIn && !adminCheckLoading && !isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center max-w-lg mx-auto mt-12"
            data-ocid="admin.error_state"
          >
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-lg font-semibold mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm">
              Your account does not have admin privileges.
            </p>
          </motion.div>
        )}

        {/* Admin content */}
        {isLoggedIn && !adminCheckLoading && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Create section */}
            <div className="mb-8 rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Create Lottery
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Launch a new lottery for players
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowCreateForm((v) => !v);
                    setEditLottery(null);
                  }}
                  size="sm"
                  className={
                    showCreateForm
                      ? "border-border/50 text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }
                  variant={showCreateForm ? "outline" : "default"}
                  data-ocid="admin.create_lottery.open_modal_button"
                >
                  {showCreateForm ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      New Lottery
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5">
                      <LotteryForm
                        initial={EMPTY_FORM}
                        onSubmit={handleCreate}
                        onCancel={() => setShowCreateForm(false)}
                        isPending={createMutation.isPending}
                        submitLabel="Create Lottery"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lotteries list */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <h2 className="font-display text-lg font-semibold">
                  All Lotteries
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lotteries?.length ?? 0} total
                </p>
              </div>

              {lotteriesLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 text-gold animate-spin" />
                </div>
              ) : (lotteries?.length ?? 0) === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No lotteries yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {lotteries?.map((lottery, index) => (
                    <motion.div
                      key={lottery.id.toString()}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors"
                      data-ocid={`admin.lottery.item.${index + 1}`}
                    >
                      {/* Edit form inline */}
                      {editLottery?.id === lottery.id ? (
                        <div className="flex-1">
                          <LotteryForm
                            initial={formDataFromLottery(lottery)}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditLottery(null)}
                            isPending={updateMutation.isPending}
                            submitLabel="Save Changes"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground truncate">
                                {lottery.name}
                              </h3>
                              {lottery.isDrawn ? (
                                <Badge className="bg-muted/40 text-muted-foreground border-border/40 text-xs">
                                  Drawn
                                </Badge>
                              ) : lottery.isActive ? (
                                <Badge className="bg-gold/15 text-gold border-gold/30 text-xs">
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-muted-foreground"
                                >
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {lottery.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                              <span>{formatPrice(lottery.price)} tokens</span>
                              <span>
                                Draw: {formatDrawDate(lottery.drawDate)}
                              </span>
                              <span>
                                Max:{" "}
                                {Number(lottery.maxTickets).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditLottery(lottery);
                                setShowCreateForm(false);
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              data-ocid={`admin.lottery.edit_button.${index + 1}`}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(lottery)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              data-ocid={`admin.lottery.delete_button.${index + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          className="bg-card border-border/60 max-w-sm"
          data-ocid="admin.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Delete Lottery?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="text-foreground font-semibold">
                "{deleteTarget?.name}"
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-border/50"
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={deleteMutation.isPending}
              data-ocid="admin.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lottery, Ticket, Visit } from "../backend.d";
import { useActor } from "./useActor";

// ─── Session ID ───────────────────────────────────────────────────────────────

export function getOrCreateSessionId(): string {
  const key = "lottery_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Lotteries ────────────────────────────────────────────────────────────────

export function useGetAllLotteries() {
  const { actor, isFetching } = useActor();
  return useQuery<Lottery[]>({
    queryKey: ["lotteries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLotteries();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetLottery(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Lottery | null>({
    queryKey: ["lottery", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getLottery(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export function useGetTicketsBySession(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Ticket[]>({
    queryKey: ["tickets-session", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTicketsBySession(sessionId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useGetTicketsByLottery(lotteryId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Ticket[]>({
    queryKey: ["tickets-lottery", lotteryId?.toString()],
    queryFn: async () => {
      if (!actor || lotteryId === null) return [];
      return actor.getTicketsByLottery(lotteryId);
    },
    enabled: !!actor && !isFetching && lotteryId !== null,
  });
}

export function usePurchaseTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionId = getOrCreateSessionId();

  return useMutation({
    mutationFn: async (lotteryId: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.purchaseTicket(sessionId, lotteryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets-session"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-lottery"] });
    },
  });
}

// ─── Visit Tracking ───────────────────────────────────────────────────────────

export function useGetTotalVisits() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["total-visits"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalVisits();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useGetRecentVisits(count: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Visit[]>({
    queryKey: ["recent-visits", count.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentVisits(count);
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useRecordVisit() {
  const { actor } = useActor();
  const sessionId = getOrCreateSessionId();

  return useMutation({
    mutationFn: async (page: string) => {
      if (!actor) return;
      await actor.recordVisit(sessionId, page);
    },
    // Fire and forget — no error handling needed
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useCreateLottery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      price: bigint;
      drawDate: bigint;
      maxTickets: bigint;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.createLottery(
        params.name,
        params.description,
        params.price,
        params.drawDate,
        params.maxTickets,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
    },
  });
}

export function useUpdateLottery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      drawDate: bigint;
      maxTickets: bigint;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateLottery(
        params.id,
        params.name,
        params.description,
        params.price,
        params.drawDate,
        params.maxTickets,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
      queryClient.invalidateQueries({ queryKey: ["lottery"] });
    },
  });
}

export function useDeleteLottery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.deleteLottery(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
    },
  });
}

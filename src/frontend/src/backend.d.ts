import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lottery {
    id: LotteryId;
    winningNumber?: bigint;
    name: string;
    drawDate: Time;
    description: string;
    isActive: boolean;
    isDrawn: boolean;
    maxTickets: bigint;
    price: bigint;
}
export type Time = bigint;
export type SessionId = string;
export interface Ticket {
    ticketNumber: bigint;
    lotteryId: LotteryId;
    sessionId: SessionId;
}
export type LotteryId = bigint;
export interface Visit {
    page: string;
    timestamp: Time;
    sessionId: SessionId;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLottery(name: string, description: string, price: bigint, drawDate: Time, maxTickets: bigint): Promise<LotteryId>;
    deleteLottery(id: LotteryId): Promise<void>;
    getAllLotteries(): Promise<Array<Lottery>>;
    getCallerUserRole(): Promise<UserRole>;
    getLottery(id: LotteryId): Promise<Lottery>;
    getRecentVisits(count: bigint): Promise<Array<Visit>>;
    getTicketsByLottery(lotteryId: LotteryId): Promise<Array<Ticket>>;
    getTicketsBySession(sessionId: SessionId): Promise<Array<Ticket>>;
    getTotalVisits(): Promise<bigint>;
    getVisitsBySession(sessionId: SessionId): Promise<Array<Visit>>;
    isCallerAdmin(): Promise<boolean>;
    purchaseTicket(sessionId: SessionId, lotteryId: LotteryId): Promise<bigint>;
    recordVisit(sessionId: SessionId, page: string): Promise<void>;
    updateLottery(id: LotteryId, name: string, description: string, price: bigint, drawDate: Time, maxTickets: bigint): Promise<void>;
}

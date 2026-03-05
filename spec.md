# Lottery Tickets App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Lottery ticket browsing and purchase UI (simulated, no real payments)
- Lottery ticket data model: ticket ID, lottery name, ticket number, price, draw date, status (active/drawn)
- Anonymous visit tracking: record each page visit with a timestamp and anonymous session ID (stored in localStorage); display total visit count and recent visits
- Admin view: manage lottery listings (create, update, mark as drawn, delete)
- Public view: browse available lotteries, "buy" a ticket (assigns a random ticket number), view owned tickets (stored per session)
- Draw results: display winning numbers and past draws

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. `Lottery` type: `{ id: Nat; name: Text; description: Text; ticketPrice: Nat; drawDate: Text; status: { #active; #drawn }; winningNumber: ?Nat; totalTickets: Nat }`
2. `Ticket` type: `{ id: Nat; lotteryId: Nat; ticketNumber: Nat; sessionId: Text; purchasedAt: Int }`
3. `Visit` type: `{ sessionId: Text; timestamp: Int; page: Text }`
4. CRUD for lotteries: `createLottery`, `getLotteries`, `getLottery`, `updateLottery`, `deleteLottery`, `drawWinner`
5. Ticket operations: `purchaseTicket`, `getTicketsBySession`, `getTicketsByLottery`
6. Visit tracking: `recordVisit`, `getVisitCount`, `getRecentVisits`

### Frontend
1. Public landing page: list active lotteries with name, price, draw date
2. Lottery detail page: description, buy ticket button, owned tickets list
3. My Tickets page: all tickets purchased in this session
4. Draw Results page: past draws with winning numbers
5. Admin page (password-protected via simple PIN): manage lotteries (create/edit/delete), trigger draw
6. Visit tracker: record visit on each page load, show visit counter in footer/sidebar
7. Anonymous session ID: generated once per browser and stored in localStorage

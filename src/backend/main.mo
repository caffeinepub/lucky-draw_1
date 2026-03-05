import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type LotteryId = Nat;
  type SessionId = Text;

  public type Lottery = {
    id : LotteryId;
    name : Text;
    description : Text;
    price : Nat;
    drawDate : Time.Time;
    isActive : Bool;
    isDrawn : Bool;
    winningNumber : ?Nat;
    maxTickets : Nat;
  };

  public type Ticket = {
    lotteryId : LotteryId;
    sessionId : SessionId;
    ticketNumber : Nat;
  };

  public type Visit = {
    sessionId : SessionId;
    page : Text;
    timestamp : Time.Time;
  };

  // Comparison module for Visit (by timestamp descending)
  module Visit {
    public func compare(visit1 : Visit, visit2 : Visit) : Order.Order {
      Int.compare(visit2.timestamp, visit1.timestamp);
    };
  };

  // State
  var nextLotteryId = 1;
  let lotteries = Map.empty<LotteryId, Lottery>();
  let tickets = List.empty<Ticket>();
  let visits = List.empty<Visit>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Lottery Management (Admin)
  public shared ({ caller }) func createLottery(name : Text, description : Text, price : Nat, drawDate : Time.Time, maxTickets : Nat) : async LotteryId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create lotteries");
    };

    let id = nextLotteryId;
    nextLotteryId += 1;

    let lottery : Lottery = {
      id;
      name;
      description;
      price;
      drawDate;
      isActive = true;
      isDrawn = false;
      winningNumber = null;
      maxTickets;
    };

    lotteries.add(id, lottery);
    id;
  };

  public shared ({ caller }) func updateLottery(id : LotteryId, name : Text, description : Text, price : Nat, drawDate : Time.Time, maxTickets : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update lotteries");
    };

    switch (lotteries.get(id)) {
      case (null) { Runtime.trap("Lottery not found") };
      case (?lottery) {
        let updatedLottery : Lottery = {
          id;
          name;
          description;
          price;
          drawDate;
          isActive = lottery.isActive;
          isDrawn = lottery.isDrawn;
          winningNumber = lottery.winningNumber;
          maxTickets;
        };
        lotteries.add(id, updatedLottery);
      };
    };
  };

  public shared ({ caller }) func deleteLottery(id : LotteryId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete lotteries");
    };

    if (not lotteries.containsKey(id)) {
      Runtime.trap("Lottery not found");
    };

    lotteries.remove(id);
  };

  public query ({ caller }) func getLottery(id : LotteryId) : async Lottery {
    switch (lotteries.get(id)) {
      case (null) { Runtime.trap("Lottery not found") };
      case (?lottery) { lottery };
    };
  };

  public query ({ caller }) func getAllLotteries() : async [Lottery] {
    lotteries.values().toArray();
  };

  // Ticket Purchasing
  public shared ({ caller }) func purchaseTicket(sessionId : SessionId, lotteryId : LotteryId) : async Nat {
    switch (lotteries.get(lotteryId)) {
      case (null) { Runtime.trap("Lottery not found") };
      case (?lottery) {
        if (not lottery.isActive or lottery.isDrawn) {
          Runtime.trap("Lottery is not active");
        };

        let ticketCount = tickets.values().toArray().filter(func(t) { t.lotteryId == lotteryId }).size();

        if (ticketCount >= lottery.maxTickets) {
          Runtime.trap("Maximum tickets reached");
        };

        let ticketNumber = ticketCount + 1;
        let ticket : Ticket = {
          lotteryId;
          sessionId;
          ticketNumber;
        };

        tickets.add(ticket);
        ticketNumber;
      };
    };
  };

  // Ticket Queries
  public query ({ caller }) func getTicketsBySession(sessionId : SessionId) : async [Ticket] {
    tickets.values().toArray().filter(func(t) { t.sessionId == sessionId });
  };

  public query ({ caller }) func getTicketsByLottery(lotteryId : LotteryId) : async [Ticket] {
    tickets.values().toArray().filter(func(t) { t.lotteryId == lotteryId });
  };

  // Visit Tracking
  public shared ({ caller }) func recordVisit(sessionId : SessionId, page : Text) : async () {
    let visit : Visit = {
      sessionId;
      page;
      timestamp = Time.now();
    };
    visits.add(visit);
  };

  public query ({ caller }) func getTotalVisits() : async Nat {
    visits.size();
  };

  public query ({ caller }) func getVisitsBySession(sessionId : SessionId) : async [Visit] {
    visits.values().toArray().filter(func(v) { v.sessionId == sessionId });
  };

  public query ({ caller }) func getRecentVisits(count : Nat) : async [Visit] {
    let allVisits = visits.values().toArray().sort();
    let limit = if (allVisits.size() < count) {
      allVisits.size();
    } else { count };
    allVisits.sliceToArray(0, limit);
  };
};

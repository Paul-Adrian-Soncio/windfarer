import { create } from "zustand";
import { generateId } from "@/lib/id";
import * as tripRepository from "@/lib/repository/tripRepository";
import * as travelSegmentRepository from "@/lib/repository/travelSegmentRepository";
import * as accommodationRepository from "@/lib/repository/accommodationRepository";
import * as advanceBookingRepository from "@/lib/repository/advanceBookingRepository";
import * as itineraryDayRepository from "@/lib/repository/itineraryDayRepository";
import * as itineraryBlockRepository from "@/lib/repository/itineraryBlockRepository";
import * as budgetAllocationRepository from "@/lib/repository/budgetAllocationRepository";
import { ApiError } from "@/lib/repository/apiClient";
import {
  Trip,
  TripSummary,
  TripStatus,
  Place,
  TravelSegment,
  Accommodation,
  AdvanceBooking,
  ItineraryBlock,
  BlockType,
  BudgetAllocation,
} from "@/types";

const STATUS_TO_API: Record<TripStatus, "SCHEDULED" | "ONGOING" | "COMPLETE" | "CANCELLED"> = {
  scheduled: "SCHEDULED",
  ongoing: "ONGOING",
  complete: "COMPLETE",
  cancelled: "CANCELLED",
};

export interface CreateTripInput {
  destination: Place;
  departureDate: string;
  departureTime?: string;
  arrivalDate: string;
  arrivalTime?: string;
  returnDate: string;
  returnTime?: string;
  currency?: string;
}

export type TripLoadStatus = "idle" | "loading" | "ready" | "error";

interface TripState {
  // Every trip the signed-in user owns, lightweight (list view only) —
  // powers the Home screen's trip list. Kept separate from `trip` (below)
  // since the list never needs every trip's full nested data.
  trips: TripSummary[];
  // Mirrors the server's User.activeTripId (see app/api/user/active-trip).
  // null means either "no trips exist" or "trips exist but none is active"
  // (e.g. right after deleting the active one) — components that care
  // which case it is should check `trips.length` too.
  activeTripId: string | null;
  // Full data for the active trip only — unchanged shape/usage from
  // before multi-trip support; every existing page keeps reading this
  // exactly as it always has.
  trip: Trip | null;
  blocks: Record<string, ItineraryBlock>;

  // Replaces the old persist-middleware hasHydrated: "idle" before the
  // initial load has been kicked off, "loading" while it's in flight,
  // "ready" once we know the real state (whether or not a trip exists),
  // "error" if the initial load itself failed.
  status: TripLoadStatus;
  error: string | null;

  // Fetches the user's trips (list) and resolves+loads the active one (if
  // any). Call once on app mount — see components/layout/TripGate.tsx.
  loadTrips: () => Promise<void>;

  // Switches which trip is active: persists it server-side, then loads
  // that trip's full data into `trip`/`blocks`.
  setActiveTrip: (tripId: string) => Promise<void>;

  // Manual status field — see types/trip.ts's TripStatus. Updates both
  // the list (`trips`) and, if this is the active trip, `trip` itself.
  updateTripStatus: (tripId: string, status: TripStatus) => Promise<void>;

  // Deletes a trip outright. If it was the active trip, the server clears
  // User.activeTripId itself (see app/api/trips/[tripId]/route.ts) — this
  // mirrors that locally rather than guessing a new active trip, so the
  // UI falls back to its own "pick a trip" empty state.
  deleteTrip: (tripId: string) => Promise<void>;

  // Trip lifecycle — wired to the real API.
  createTrip: (input: CreateTripInput) => Promise<void>;
  updateTripBasics: (patch: Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>) => Promise<void>;

  // Travel segments, accommodations, advance bookings — all wired to the
  // real API. Everything below (itinerary, budget) is still local-only
  // for now; that's the next migration step.
  addTravelSegment: (segment: Omit<TravelSegment, "id">) => Promise<void>;
  updateTravelSegment: (id: string, patch: Partial<TravelSegment>) => Promise<void>;
  removeTravelSegment: (id: string) => Promise<void>;

  addAccommodation: (acc: Omit<Accommodation, "id">) => Promise<void>;
  updateAccommodation: (id: string, patch: Partial<Accommodation>) => Promise<void>;
  removeAccommodation: (id: string) => Promise<void>;

  addAdvanceBooking: (b: Omit<AdvanceBooking, "id">) => Promise<void>;
  updateAdvanceBooking: (id: string, patch: Partial<AdvanceBooking>) => Promise<void>;
  removeAdvanceBooking: (id: string) => Promise<void>;

  // Itinerary days — wired to the real API.
  addDay: (label?: string) => Promise<void>;
  renameDay: (dayId: string, label: string) => Promise<void>;
  setDayDate: (dayId: string, date: string | undefined) => Promise<void>;
  removeDay: (dayId: string) => Promise<void>;

  // Itinerary blocks — wired to the real API.
  addBlock: (dayId: string, block: Omit<ItineraryBlock, "id" | "dayId">, index?: number) => Promise<void>;
  updateBlock: (id: string, patch: Partial<ItineraryBlock>) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
  // Optimistic: applies the reorder to local state immediately (so
  // dragging feels instant), then commits it to the server in the
  // background. Rolls back to the pre-drag arrangement if the request
  // fails. Deliberately NOT awaited by its caller (ItineraryDndContext) —
  // dnd-kit's onDragEnd isn't async, and the whole point is the UI doesn't
  // wait on the network for a drag to feel done.
  moveBlock: (blockId: string, toDayId: string, toIndex: number) => void;

  // Budget — wired to the real API.
  setTotalBudget: (amount: number | null) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  // Scope (kind + dayId/blockId) can only be set at creation — pass an id
  // to edit an existing allocation's label/amount, omit it to create a new
  // one. See lib/repository/budgetAllocationRepository.ts.
  upsertAllocation: (alloc: Omit<BudgetAllocation, "id"> & { id?: string }) => Promise<void>;
  removeAllocation: (id: string) => Promise<void>;
}

function touch(trip: Trip): Trip {
  return { ...trip, updatedAt: new Date().toISOString() };
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export const useTripStore = create<TripState>()((set, get) => ({
      trips: [],
      activeTripId: null,
      trip: null,
      blocks: {},
      status: "idle",
      error: null,

      loadTrips: async () => {
        set({ status: "loading", error: null });
        try {
          const [trips, activeTripId] = await Promise.all([
            tripRepository.listTripSummaries(),
            tripRepository.getActiveTripId(),
          ]);

          if (trips.length === 0) {
            set({ trips: [], activeTripId: null, trip: null, blocks: {}, status: "ready" });
            return;
          }

          // Same fallback as tripRepository.findExistingTrip: prefer the
          // explicitly-set active trip, but fall back to the first trip
          // in the list so an existing single-trip user (who never had to
          // choose an active one) keeps working with zero behavior change.
          const resolvedId = activeTripId && trips.some((t) => t.id === activeTripId) ? activeTripId : trips[0].id;
          const full = await tripRepository.fetchFullTrip(resolvedId);
          set({ trips, activeTripId: resolvedId, trip: full.trip, blocks: full.blocks, status: "ready" });
        } catch (err) {
          set({ status: "error", error: errorMessage(err) });
        }
      },

      setActiveTrip: async (tripId) => {
        try {
          await tripRepository.setActiveTripId(tripId);
          const full = await tripRepository.fetchFullTrip(tripId);
          set({ activeTripId: tripId, trip: full.trip, blocks: full.blocks });
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      updateTripStatus: async (tripId, status) => {
        try {
          const updated = await tripRepository.updateTripBasics(tripId, { status: STATUS_TO_API[status] });
          set((state) => ({
            trips: state.trips.map((t) => (t.id === tripId ? { ...t, status: updated.status } : t)),
            trip: state.trip && state.trip.id === tripId ? touch({ ...state.trip, status: updated.status }) : state.trip,
          }));
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      deleteTrip: async (tripId) => {
        try {
          await tripRepository.deleteTrip(tripId);
          set((state) => {
            const wasActive = state.activeTripId === tripId;
            return {
              trips: state.trips.filter((t) => t.id !== tripId),
              activeTripId: wasActive ? null : state.activeTripId,
              trip: wasActive ? null : state.trip,
              blocks: wasActive ? {} : state.blocks,
            };
          });
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      createTrip: async (input) => {
        set({ status: "loading", error: null });
        try {
          const trip = await tripRepository.createTrip(input);
          // A freshly created trip is the obvious thing to want active —
          // set it so, matching what a single-trip user already saw
          // (their one trip was always "the" trip with zero extra steps).
          await tripRepository.setActiveTripId(trip.id);
          set((state) => ({
            trips: [...state.trips, { id: trip.id, destination: trip.destination, departureDate: trip.departureDate, returnDate: trip.returnDate, status: trip.status }],
            activeTripId: trip.id,
            trip,
            blocks: {},
            status: "ready",
          }));
        } catch (err) {
          set({ status: "error", error: errorMessage(err) });
          throw err;
        }
      },

      updateTripBasics: async (patch) => {
        const { trip: previousTrip } = get();
        if (!previousTrip) return;

        try {
          const updated = await tripRepository.updateTripBasics(previousTrip.id, {
            destinationName: patch.destination?.name,
            destinationLat: patch.destination?.lat,
            destinationLng: patch.destination?.lng,
            departureDate: patch.departureDate,
            departureTime: patch.departureTime,
            arrivalDate: patch.arrivalDate,
            arrivalTime: patch.arrivalTime,
            returnDate: patch.returnDate,
            returnTime: patch.returnTime,
          });
          // `updated` comes back through translateNewTrip (same translator
          // used right after creating a trip), which always defaults every
          // relation — travelSegments, accommodations, advanceBookings,
          // itineraryDays, budget.allocations — to []. That's correct for a
          // brand-new trip, but PATCH /api/trips/[tripId] only ever touches
          // the Trip row's own columns, so those empty arrays here don't
          // mean "these are now empty" — they mean "this response doesn't
          // know about them." Spreading `updated` over `state.trip` would
          // wipe out everything already loaded. Pick only the fields PATCH
          // actually returns fresh data for, instead of the whole object.
          set((state) =>
            state.trip
              ? {
                  trip: {
                    ...state.trip,
                    destination: updated.destination,
                    departureDate: updated.departureDate,
                    departureTime: updated.departureTime,
                    arrivalDate: updated.arrivalDate,
                    arrivalTime: updated.arrivalTime,
                    returnDate: updated.returnDate,
                    returnTime: updated.returnTime,
                    updatedAt: updated.updatedAt,
                    budget: {
                      ...state.trip.budget,
                      totalBudget: updated.budget.totalBudget,
                      currency: updated.budget.currency,
                    },
                  },
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      addTravelSegment: async (segment) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const newSegment = await travelSegmentRepository.createTravelSegment(trip.id, segment);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, travelSegments: [...state.trip.travelSegments, newSegment] }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      updateTravelSegment: async (id, patch) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const updated = await travelSegmentRepository.updateTravelSegment(trip.id, id, patch);
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    travelSegments: state.trip.travelSegments.map((s) => (s.id === id ? updated : s)),
                  }),
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      removeTravelSegment: async (id) => {
        const { trip } = get();
        if (!trip) return;
        try {
          await travelSegmentRepository.deleteTravelSegment(trip.id, id);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, travelSegments: state.trip.travelSegments.filter((s) => s.id !== id) }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      addAccommodation: async (acc) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const newAcc = await accommodationRepository.createAccommodation(trip.id, acc);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, accommodations: [...state.trip.accommodations, newAcc] }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      updateAccommodation: async (id, patch) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const updated = await accommodationRepository.updateAccommodation(trip.id, id, patch);
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    accommodations: state.trip.accommodations.map((a) => (a.id === id ? updated : a)),
                  }),
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      removeAccommodation: async (id) => {
        const { trip } = get();
        if (!trip) return;
        try {
          await accommodationRepository.deleteAccommodation(trip.id, id);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, accommodations: state.trip.accommodations.filter((a) => a.id !== id) }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      addAdvanceBooking: async (b) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const newBooking = await advanceBookingRepository.createAdvanceBooking(trip.id, b);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, advanceBookings: [...state.trip.advanceBookings, newBooking] }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      updateAdvanceBooking: async (id, patch) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const updated = await advanceBookingRepository.updateAdvanceBooking(trip.id, id, patch);
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    advanceBookings: state.trip.advanceBookings.map((b) => (b.id === id ? updated : b)),
                  }),
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      removeAdvanceBooking: async (id) => {
        const { trip } = get();
        if (!trip) return;
        try {
          await advanceBookingRepository.deleteAdvanceBooking(trip.id, id);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, advanceBookings: state.trip.advanceBookings.filter((b) => b.id !== id) }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      addDay: async (label) => {
        const { trip } = get();
        if (!trip) return;
        const dayNumber = trip.itineraryDays.length + 1;
        try {
          const newDay = await itineraryDayRepository.createItineraryDay(trip.id, label ?? `Day ${dayNumber}`);
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, itineraryDays: [...state.trip.itineraryDays, newDay] }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      renameDay: async (dayId, label) => {
        const { trip } = get();
        if (!trip) return;
        const existingDay = trip.itineraryDays.find((d) => d.id === dayId);
        if (!existingDay) return;
        try {
          const updated = await itineraryDayRepository.updateItineraryDay(
            trip.id,
            dayId,
            { label },
            existingDay.blockIds
          );
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    itineraryDays: state.trip.itineraryDays.map((d) => (d.id === dayId ? updated : d)),
                  }),
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      setDayDate: async (dayId, date) => {
        const { trip } = get();
        if (!trip) return;
        const existingDay = trip.itineraryDays.find((d) => d.id === dayId);
        if (!existingDay) return;
        try {
          const updated = await itineraryDayRepository.updateItineraryDay(
            trip.id,
            dayId,
            { date },
            existingDay.blockIds
          );
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    itineraryDays: state.trip.itineraryDays.map((d) => (d.id === dayId ? updated : d)),
                  }),
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      removeDay: async (dayId) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const day = trip.itineraryDays.find((d) => d.id === dayId);
        try {
          await itineraryDayRepository.deleteItineraryDay(trip.id, dayId);
          const remainingBlocks = { ...blocks };
          day?.blockIds.forEach((blockId) => delete remainingBlocks[blockId]);
          set((state) =>
            state.trip
              ? {
                  trip: touch({ ...state.trip, itineraryDays: state.trip.itineraryDays.filter((d) => d.id !== dayId) }),
                  blocks: remainingBlocks,
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },

      addBlock: async (dayId, block, index) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const day = trip.itineraryDays.find((d) => d.id === dayId);
        if (!day) return;
        try {
          const newBlock = await itineraryBlockRepository.createItineraryBlock(trip.id, dayId, block);
          const blockIds = [...day.blockIds];
          const insertAt = index === undefined ? blockIds.length : index;
          blockIds.splice(insertAt, 0, newBlock.id);
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    itineraryDays: state.trip.itineraryDays.map((d) => (d.id === dayId ? { ...d, blockIds } : d)),
                  }),
                  blocks: { ...state.blocks, [newBlock.id]: newBlock },
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      updateBlock: async (id, patch) => {
        const { trip, blocks } = get();
        if (!trip || !blocks[id]) return;
        const dayId = blocks[id].dayId;
        try {
          const updated = await itineraryBlockRepository.updateItineraryBlock(trip.id, dayId, id, patch);
          set((state) => ({
            trip: state.trip ? touch(state.trip) : state.trip,
            blocks: { ...state.blocks, [id]: updated },
          }));
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      removeBlock: async (id) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const block = blocks[id];
        if (!block) return;
        try {
          await itineraryBlockRepository.deleteItineraryBlock(trip.id, block.dayId, id);
          set((state) => {
            if (!state.trip) return state;
            const remainingBlocks = { ...state.blocks };
            delete remainingBlocks[id];
            return {
              trip: touch({
                ...state.trip,
                itineraryDays: state.trip.itineraryDays.map((d) =>
                  d.id === block.dayId ? { ...d, blockIds: d.blockIds.filter((bId) => bId !== id) } : d
                ),
              }),
              blocks: remainingBlocks,
            };
          });
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      moveBlock: (blockId, toDayId, toIndex) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const block = blocks[blockId];
        if (!block) return;
        const fromDayId = block.dayId;

        // Snapshot exactly what we're about to change, so a failed
        // request can restore precisely this — not the whole trip, just
        // the two arrays a move ever touches (the source and destination
        // day's blockIds) plus the moved block's own dayId.
        const previousItineraryDays = trip.itineraryDays;
        const previousBlock = block;

        const itineraryDays = trip.itineraryDays.map((d) => ({ ...d, blockIds: [...d.blockIds] }));
        const fromDay = itineraryDays.find((d) => d.id === fromDayId);
        const toDay = itineraryDays.find((d) => d.id === toDayId);
        if (!fromDay || !toDay) return;

        fromDay.blockIds = fromDay.blockIds.filter((id) => id !== blockId);
        const clampedIndex = Math.max(0, Math.min(toIndex, toDay.blockIds.length));
        toDay.blockIds.splice(clampedIndex, 0, blockId);

        // Optimistic: apply immediately so the drag feels instant.
        set((state) =>
          state.trip
            ? {
                trip: touch({ ...state.trip, itineraryDays }),
                blocks: { ...state.blocks, [blockId]: { ...block, dayId: toDayId } },
              }
            : state
        );

        // Commit in the background. Deliberately not awaited by the
        // caller (dnd-kit's onDragEnd isn't async) — this function itself
        // stays synchronous from the caller's perspective, and handles
        // its own success/failure entirely internally.
        itineraryBlockRepository
          .moveItineraryBlock(trip.id, fromDayId, blockId, toDayId, toIndex)
          .then((confirmedBlock) => {
            // Reconcile with the server's exact result in case it computed
            // something slightly different (e.g. another change landed
            // between our optimistic update and this response resolving).
            set((state) =>
              state.trip && state.blocks[blockId]
                ? { blocks: { ...state.blocks, [blockId]: confirmedBlock } }
                : state
            );
          })
          .catch((err) => {
            // Roll back to exactly the pre-drag arrangement.
            set((state) =>
              state.trip
                ? {
                    trip: touch({ ...state.trip, itineraryDays: previousItineraryDays }),
                    blocks: { ...state.blocks, [blockId]: previousBlock },
                    error: errorMessage(err),
                  }
                : state
            );
          });
      },

      setTotalBudget: async (amount) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const updated = await tripRepository.updateTripBasics(trip.id, { totalBudget: amount });
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, budget: { ...state.trip.budget, totalBudget: updated.budget.totalBudget } }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      setCurrency: async (currency) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const updated = await tripRepository.updateTripBasics(trip.id, { currency });
          set((state) =>
            state.trip
              ? { trip: touch({ ...state.trip, budget: { ...state.trip.budget, currency: updated.budget.currency } }) }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      upsertAllocation: async (alloc) => {
        const { trip } = get();
        if (!trip) return;
        try {
          const saved = alloc.id
            ? await budgetAllocationRepository.updateBudgetAllocation(trip.id, alloc.id, {
                label: alloc.label,
                amount: alloc.amount,
              })
            : await budgetAllocationRepository.createBudgetAllocation(trip.id, alloc);
          set((state) => {
            if (!state.trip) return state;
            const existingIndex = state.trip.budget.allocations.findIndex((a) => a.id === saved.id);
            const allocations =
              existingIndex >= 0
                ? state.trip.budget.allocations.map((a, i) => (i === existingIndex ? saved : a))
                : [...state.trip.budget.allocations, saved];
            return { trip: touch({ ...state.trip, budget: { ...state.trip.budget, allocations } }) };
          });
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
      removeAllocation: async (id) => {
        const { trip } = get();
        if (!trip) return;
        try {
          await budgetAllocationRepository.deleteBudgetAllocation(trip.id, id);
          set((state) =>
            state.trip
              ? {
                  trip: touch({
                    ...state.trip,
                    budget: { ...state.trip.budget, allocations: state.trip.budget.allocations.filter((a) => a.id !== id) },
                  }),
                }
              : state
          );
        } catch (err) {
          set({ error: errorMessage(err) });
          throw err;
        }
      },
}));

export type { BlockType };

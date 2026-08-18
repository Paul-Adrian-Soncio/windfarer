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
  Place,
  TravelSegment,
  Accommodation,
  AdvanceBooking,
  ItineraryBlock,
  BlockType,
  BudgetAllocation,
} from "@/types";

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
  trip: Trip | null;
  blocks: Record<string, ItineraryBlock>;

  // Replaces the old persist-middleware hasHydrated: "idle" before the
  // initial load has been kicked off, "loading" while it's in flight,
  // "ready" once we know the real state (whether or not a trip exists),
  // "error" if the initial load itself failed.
  status: TripLoadStatus;
  error: string | null;

  // Fetches the user's trip (if any) from the API. Call once on app
  // mount — see components/layout/TripGate.tsx.
  loadTrip: () => Promise<void>;

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
      trip: null,
      blocks: {},
      status: "idle",
      error: null,

      loadTrip: async () => {
        set({ status: "loading", error: null });
        try {
          const result = await tripRepository.findExistingTrip();
          if (!result) {
            set({ trip: null, blocks: {}, status: "ready" });
            return;
          }
          set({ trip: result.trip, blocks: result.blocks, status: "ready" });
        } catch (err) {
          set({ status: "error", error: errorMessage(err) });
        }
      },

      createTrip: async (input) => {
        set({ status: "loading", error: null });
        try {
          const trip = await tripRepository.createTrip(input);
          set({ trip, blocks: {}, status: "ready" });
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
          // The API only knows about the Trip row's own fields — merge the
          // response into the existing trip rather than replacing it, so
          // segments/days/etc. (not part of this response) aren't dropped.
          set((state) => ({
            trip: state.trip ? { ...state.trip, ...updated } : state.trip,
          }));
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

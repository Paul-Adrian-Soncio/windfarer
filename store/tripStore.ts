import { create } from "zustand";
import { generateId } from "@/lib/id";
import * as tripRepository from "@/lib/repository/tripRepository";
import * as travelSegmentRepository from "@/lib/repository/travelSegmentRepository";
import * as accommodationRepository from "@/lib/repository/accommodationRepository";
import * as advanceBookingRepository from "@/lib/repository/advanceBookingRepository";
import { ApiError } from "@/lib/repository/apiClient";
import {
  Trip,
  Place,
  TravelSegment,
  Accommodation,
  AdvanceBooking,
  ItineraryDay,
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

  // Itinerary days
  addDay: (label?: string) => void;
  renameDay: (dayId: string, label: string) => void;
  setDayDate: (dayId: string, date: string | undefined) => void;
  removeDay: (dayId: string) => void;

  // Itinerary blocks
  addBlock: (dayId: string, block: Omit<ItineraryBlock, "id" | "dayId">, index?: number) => void;
  updateBlock: (id: string, patch: Partial<ItineraryBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (blockId: string, toDayId: string, toIndex: number) => void;

  // Budget
  setTotalBudget: (amount: number | null) => void;
  setCurrency: (currency: string) => void;
  upsertAllocation: (alloc: Omit<BudgetAllocation, "id"> & { id?: string }) => void;
  removeAllocation: (id: string) => void;
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

      addDay: (label) => {
        const { trip } = get();
        if (!trip) return;
        const dayNumber = trip.itineraryDays.length + 1;
        const newDay: ItineraryDay = {
          id: generateId(),
          label: label ?? `Day ${dayNumber}`,
          blockIds: [],
        };
        set({ trip: touch({ ...trip, itineraryDays: [...trip.itineraryDays, newDay] }) });
      },
      renameDay: (dayId, label) => {
        const { trip } = get();
        if (!trip) return;
        set({
          trip: touch({
            ...trip,
            itineraryDays: trip.itineraryDays.map((d) => (d.id === dayId ? { ...d, label } : d)),
          }),
        });
      },
      setDayDate: (dayId, date) => {
        const { trip } = get();
        if (!trip) return;
        set({
          trip: touch({
            ...trip,
            itineraryDays: trip.itineraryDays.map((d) => (d.id === dayId ? { ...d, date } : d)),
          }),
        });
      },
      removeDay: (dayId) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const day = trip.itineraryDays.find((d) => d.id === dayId);
        const remainingBlocks = { ...blocks };
        day?.blockIds.forEach((blockId) => delete remainingBlocks[blockId]);
        set({
          trip: touch({ ...trip, itineraryDays: trip.itineraryDays.filter((d) => d.id !== dayId) }),
          blocks: remainingBlocks,
        });
      },

      addBlock: (dayId, block, index) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const day = trip.itineraryDays.find((d) => d.id === dayId);
        if (!day) return;
        const id = generateId();
        const newBlock: ItineraryBlock = { ...block, id, dayId };
        const blockIds = [...day.blockIds];
        const insertAt = index === undefined ? blockIds.length : index;
        blockIds.splice(insertAt, 0, id);
        set({
          trip: touch({
            ...trip,
            itineraryDays: trip.itineraryDays.map((d) => (d.id === dayId ? { ...d, blockIds } : d)),
          }),
          blocks: { ...blocks, [id]: newBlock },
        });
      },
      updateBlock: (id, patch) => {
        const { trip, blocks } = get();
        if (!trip || !blocks[id]) return;
        set({
          trip: touch(trip),
          blocks: { ...blocks, [id]: { ...blocks[id], ...patch } },
        });
      },
      removeBlock: (id) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const block = blocks[id];
        if (!block) return;
        const remainingBlocks = { ...blocks };
        delete remainingBlocks[id];
        set({
          trip: touch({
            ...trip,
            itineraryDays: trip.itineraryDays.map((d) =>
              d.id === block.dayId ? { ...d, blockIds: d.blockIds.filter((bId) => bId !== id) } : d
            ),
          }),
          blocks: remainingBlocks,
        });
      },
      moveBlock: (blockId, toDayId, toIndex) => {
        const { trip, blocks } = get();
        if (!trip) return;
        const block = blocks[blockId];
        if (!block) return;
        const fromDayId = block.dayId;

        const itineraryDays = trip.itineraryDays.map((d) => ({ ...d, blockIds: [...d.blockIds] }));
        const fromDay = itineraryDays.find((d) => d.id === fromDayId);
        const toDay = itineraryDays.find((d) => d.id === toDayId);
        if (!fromDay || !toDay) return;

        fromDay.blockIds = fromDay.blockIds.filter((id) => id !== blockId);
        const clampedIndex = Math.max(0, Math.min(toIndex, toDay.blockIds.length));
        toDay.blockIds.splice(clampedIndex, 0, blockId);

        set({
          trip: touch({ ...trip, itineraryDays }),
          blocks: { ...blocks, [blockId]: { ...block, dayId: toDayId } },
        });
      },

      setTotalBudget: (amount) => {
        const { trip } = get();
        if (!trip) return;
        set({ trip: touch({ ...trip, budget: { ...trip.budget, totalBudget: amount } }) });
      },
      setCurrency: (currency) => {
        const { trip } = get();
        if (!trip) return;
        set({ trip: touch({ ...trip, budget: { ...trip.budget, currency } }) });
      },
      upsertAllocation: (alloc) => {
        const { trip } = get();
        if (!trip) return;
        const id = alloc.id ?? generateId();
        const existingIndex = trip.budget.allocations.findIndex((a) => a.id === id);
        const newAllocation: BudgetAllocation = { ...alloc, id };
        const allocations =
          existingIndex >= 0
            ? trip.budget.allocations.map((a, i) => (i === existingIndex ? newAllocation : a))
            : [...trip.budget.allocations, newAllocation];
        set({ trip: touch({ ...trip, budget: { ...trip.budget, allocations } }) });
      },
      removeAllocation: (id) => {
        const { trip } = get();
        if (!trip) return;
        set({
          trip: touch({
            ...trip,
            budget: { ...trip.budget, allocations: trip.budget.allocations.filter((a) => a.id !== id) },
          }),
        });
      },
}));

export type { BlockType };

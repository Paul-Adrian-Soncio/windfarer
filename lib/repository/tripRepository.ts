import { localStorageAdapter } from "@/lib/storage/localStorageAdapter";
import { TripRepository } from "./types";

const STORAGE_KEY = "windfarer.trip.v1";

export const localTripRepository: TripRepository = {
  async load() {
    return localStorageAdapter.get(STORAGE_KEY);
  },
  async save(serializedState: string) {
    localStorageAdapter.set(STORAGE_KEY, serializedState);
  },
};

// Active implementation. Swap this out (or branch on env) once a real
// backend exists — nothing outside this file needs to change.
export const tripRepository: TripRepository = localTripRepository;

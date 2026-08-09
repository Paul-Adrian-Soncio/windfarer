import { PersistStorage, StorageValue } from "zustand/middleware";
import { tripRepository } from "@/lib/repository/tripRepository";

/**
 * Bridges Zustand's `persist` middleware to `tripRepository` instead of
 * calling `window.localStorage` directly. This is the seam to change when
 * a real backend arrives: either swap `tripRepository`'s implementation
 * (see lib/repository/tripRepository.ts) and keep this file as-is, or drop
 * `persist` entirely in favor of explicit async repository calls from store
 * actions (better fit once auth/loading/error states matter).
 */
export function createTripPersistStorage<S>(): PersistStorage<S> {
  return {
    async getItem(name) {
      const raw = await tripRepository.load();
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        return null;
      }
    },
    async setItem(name, value) {
      await tripRepository.save(JSON.stringify(value));
    },
    async removeItem(name) {
      await tripRepository.save("");
    },
  };
}

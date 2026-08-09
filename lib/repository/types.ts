/**
 * Repository contract for wherever WindFarer's persisted state lives.
 * Today `localTripRepository` (tripRepository.ts) backs this with
 * localStorage. When a real backend arrives, a `remoteTripRepository`
 * implementing the same interface (backed by `fetch`) can be swapped in
 * without touching the store's actions or any component.
 */
export interface TripRepository {
  load: () => Promise<string | null>;
  save: (serializedState: string) => Promise<void>;
}

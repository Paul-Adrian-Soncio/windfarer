-- Data-only fix, no schema change: every ItineraryDay and ItineraryBlock
-- created before this session's fix (see app/api/trips/[tripId]/days/route.ts
-- and .../blocks/route.ts) got sortOrder = 0 regardless of how many
-- siblings already existed, since POST never computed a real value and
-- Zod's schema default silently filled in 0. Ties have no defined order in
-- Postgres, so the itinerary looked stable only by luck of physical row
-- order — until any UPDATE (e.g. renaming a day) could shuffle it.
--
-- Backfills every existing row's sortOrder using ctid (physical row order)
-- as the ordering signal, since these tables have no createdAt column and
-- every row here was purely appended (no working reorder has ever
-- succeeded, since this exact bug prevented one) — ctid order matches
-- creation order for every row this migration will touch.

WITH ranked_days AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "tripId" ORDER BY ctid) - 1 AS new_sort_order
  FROM "ItineraryDay"
)
UPDATE "ItineraryDay"
SET "sortOrder" = ranked_days.new_sort_order
FROM ranked_days
WHERE "ItineraryDay".id = ranked_days.id;

WITH ranked_blocks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "dayId" ORDER BY ctid) - 1 AS new_sort_order
  FROM "ItineraryBlock"
)
UPDATE "ItineraryBlock"
SET "sortOrder" = ranked_blocks.new_sort_order
FROM ranked_blocks
WHERE "ItineraryBlock".id = ranked_blocks.id;

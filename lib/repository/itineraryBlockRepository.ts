import { apiFetch } from "./apiClient";
import { ApiItineraryBlock } from "./apiTypes";
import { translateItineraryBlock } from "./translate";
import { BlockType, ItineraryBlock, LocalTravelMode } from "@/types";

function toUpperType(type: BlockType): ApiItineraryBlock["type"] {
  return type.toUpperCase() as ApiItineraryBlock["type"];
}
function toUpperMealType(mealType: NonNullable<ItineraryBlock["mealType"]>): NonNullable<ApiItineraryBlock["mealType"]> {
  return mealType.toUpperCase() as NonNullable<ApiItineraryBlock["mealType"]>;
}
function toUpperTravelMode(mode: LocalTravelMode): NonNullable<ApiItineraryBlock["travelMode"]> {
  return mode.toUpperCase() as NonNullable<ApiItineraryBlock["travelMode"]>;
}

/** Body shape POST/PATCH .../blocks expect — see lib/validation/itineraryBlock.ts. */
interface ItineraryBlockBody {
  type?: ApiItineraryBlock["type"];
  title?: string;
  description?: string | null;
  scheduledTime?: string | null;
  plannedExpense?: number | null;
  locationName?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  mealType?: ApiItineraryBlock["mealType"];
  travelMode?: ApiItineraryBlock["travelMode"];
  sortOrder?: number;
  dayId?: string;
}

function toItineraryBlockBody(block: Partial<ItineraryBlock>): ItineraryBlockBody {
  const body: ItineraryBlockBody = {};

  if (block.type !== undefined) body.type = toUpperType(block.type);
  if (block.title !== undefined) body.title = block.title;
  if (block.description !== undefined) body.description = block.description ?? null;
  if (block.scheduledTime !== undefined) body.scheduledTime = block.scheduledTime ?? null;
  if (block.plannedExpense !== undefined) body.plannedExpense = block.plannedExpense ?? null;
  if (block.location !== undefined) {
    body.locationName = block.location?.name ?? null;
    body.locationLat = block.location?.lat ?? null;
    body.locationLng = block.location?.lng ?? null;
  }
  if (block.mealType !== undefined) body.mealType = block.mealType ? toUpperMealType(block.mealType) : null;
  if (block.travelMode !== undefined) body.travelMode = block.travelMode ? toUpperTravelMode(block.travelMode) : null;

  return body;
}

export async function createItineraryBlock(
  tripId: string,
  dayId: string,
  block: Omit<ItineraryBlock, "id" | "dayId">
): Promise<ItineraryBlock> {
  const apiBlock = await apiFetch<ApiItineraryBlock>(`/api/trips/${tripId}/days/${dayId}/blocks`, {
    method: "POST",
    body: JSON.stringify(toItineraryBlockBody(block)),
  });
  return translateItineraryBlock(apiBlock);
}

export async function updateItineraryBlock(
  tripId: string,
  dayId: string,
  blockId: string,
  patch: Partial<ItineraryBlock>
): Promise<ItineraryBlock> {
  const apiBlock = await apiFetch<ApiItineraryBlock>(
    `/api/trips/${tripId}/days/${dayId}/blocks/${blockId}`,
    { method: "PATCH", body: JSON.stringify(toItineraryBlockBody(patch)) }
  );
  return translateItineraryBlock(apiBlock);
}

export async function deleteItineraryBlock(tripId: string, dayId: string, blockId: string): Promise<void> {
  await apiFetch<void>(`/api/trips/${tripId}/days/${dayId}/blocks/${blockId}`, { method: "DELETE" });
}

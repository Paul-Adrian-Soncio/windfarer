import { Plane, Ship, Car, TrainFront, Bus, Circle } from "lucide-react";
import {
  Compass,
  UtensilsCrossed,
  Landmark,
  Sofa,
  Navigation,
  SquareDashedBottom,
} from "lucide-react";
import { TravelMode } from "@/types";
import { BlockType } from "@/types";

export const TRAVEL_MODE_OPTIONS: { value: TravelMode; label: string; icon: typeof Plane }[] = [
  { value: "plane", label: "Plane", icon: Plane },
  { value: "boat", label: "Boat", icon: Ship },
  { value: "car", label: "Car", icon: Car },
  { value: "train", label: "Train", icon: TrainFront },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "other", label: "Other", icon: Circle },
];

// colorClass: chip background used in the block-type picker.
// borderClass: 3px left-border accent used on itinerary block cards (see mockup .block.t-*).
export const BLOCK_TYPE_OPTIONS: {
  value: BlockType;
  label: string;
  icon: typeof Compass;
  colorClass: string;
  borderClass: string;
}[] = [
  { value: "activity", label: "Activity", icon: Compass, colorClass: "bg-secondary-tint text-secondary-ink", borderClass: "border-l-secondary-500" },
  { value: "meal", label: "Meal", icon: UtensilsCrossed, colorClass: "bg-accent-tint text-accent-500", borderClass: "border-l-accent-500" },
  { value: "visit", label: "Visit", icon: Landmark, colorClass: "bg-primary-tint text-primary-700", borderClass: "border-l-primary-700" },
  { value: "rest", label: "Rest", icon: Sofa, colorClass: "bg-ink-100 text-ink-700", borderClass: "border-l-ink-400" },
  { value: "travel", label: "Travel", icon: Navigation, colorClass: "bg-moss-tint text-moss", borderClass: "border-l-moss" },
  { value: "blank", label: "Custom", icon: SquareDashedBottom, colorClass: "bg-ink-100 text-ink-600", borderClass: "border-l-ink-300" },
];

export function getTravelModeOption(mode: TravelMode) {
  return TRAVEL_MODE_OPTIONS.find((o) => o.value === mode) ?? TRAVEL_MODE_OPTIONS[TRAVEL_MODE_OPTIONS.length - 1];
}

export function getBlockTypeOption(type: BlockType) {
  return BLOCK_TYPE_OPTIONS.find((o) => o.value === type) ?? BLOCK_TYPE_OPTIONS[BLOCK_TYPE_OPTIONS.length - 1];
}

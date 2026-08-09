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

export const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string; icon: typeof Compass; colorClass: string }[] = [
  { value: "activity", label: "Activity", icon: Compass, colorClass: "bg-primary-100 text-primary-700" },
  { value: "meal", label: "Meal", icon: UtensilsCrossed, colorClass: "bg-accent-100 text-accent-700" },
  { value: "visit", label: "Visit", icon: Landmark, colorClass: "bg-primary-100 text-primary-800" },
  { value: "rest", label: "Rest", icon: Sofa, colorClass: "bg-ink-100 text-ink-700" },
  { value: "travel", label: "Travel", icon: Navigation, colorClass: "bg-success-500/15 text-success-600" },
  { value: "blank", label: "Custom", icon: SquareDashedBottom, colorClass: "bg-ink-100 text-ink-600" },
];

export function getTravelModeOption(mode: TravelMode) {
  return TRAVEL_MODE_OPTIONS.find((o) => o.value === mode) ?? TRAVEL_MODE_OPTIONS[TRAVEL_MODE_OPTIONS.length - 1];
}

export function getBlockTypeOption(type: BlockType) {
  return BLOCK_TYPE_OPTIONS.find((o) => o.value === type) ?? BLOCK_TYPE_OPTIONS[BLOCK_TYPE_OPTIONS.length - 1];
}

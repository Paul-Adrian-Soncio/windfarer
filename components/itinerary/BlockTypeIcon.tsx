import { getBlockTypeOption } from "@/lib/constants";
import { BlockType } from "@/types";
import { cn } from "@/lib/cn";

export function BlockTypeIcon({ type, className }: { type: BlockType; className?: string }) {
  const { icon: Icon, colorClass } = getBlockTypeOption(type);
  return (
    <span className={cn("inline-flex items-center justify-center rounded-full p-1.5", colorClass, className)}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

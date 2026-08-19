import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[12.5px] font-semibold text-ink-700">{label}</span>}
      {children}
      {hint && <span className="text-[11.5px] text-ink-500">{hint}</span>}
    </label>
  );
}

// Exported so custom trigger buttons (DatePicker, TimePicker, Dropdown —
// see components/ui/Popover.tsx and friends) can look identical to a real
// Input/Select without duplicating this string.
export const inputBase =
  "w-full rounded-xl border-[1.5px] border-hair bg-surface-2 px-3.5 py-2.5 text-[14.5px] text-ink-900 placeholder:text-ink-500 outline-none transition-colors focus:border-primary-700 focus:bg-white [color-scheme:light]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        inputBase,
        // Normalize the native date/time picker glyph to sit quietly in ink-500
        // rather than the browser's default blue/gray, so it doesn't clash.
        (type === "date" || type === "time") &&
          "[&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputBase, className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(inputBase, className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

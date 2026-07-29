"use client";

import type { ReactNode } from "react";
import { ActionButton } from "@/components/ui/Action";
import { useBooking } from "./BookingProvider";

/**
 * A one-line client boundary so server-rendered pages can offer the booking CTA
 * without becoming client components themselves.
 */
export function BookingTrigger({
  children,
  variant = "primary",
  tone = "light",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  tone?: "light" | "dark";
}) {
  const { open } = useBooking();
  return (
    <ActionButton variant={variant} tone={tone} onClick={open}>
      {children}
    </ActionButton>
  );
}

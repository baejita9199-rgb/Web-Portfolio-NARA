"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` warns when React renders on the server. Motion setup must
 * still run before paint on the client, so the hook is swapped rather than
 * downgraded.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

"use client";

import { useSyncExternalStore } from "react";
import { getAccessToken } from "@/lib/axios";

/** No-op subscribe: the access token doesn't change during a page view. */
const subscribeToNothing = () => () => {};

/**
 * Whether an access token is present, safe to read during render.
 *
 * Returns `null` until hydration finishes, then `true`/`false`. That third
 * state is the point: it lets a screen tell "we don't know yet" (show a
 * skeleton) apart from "definitely signed out" (show the sign-in prompt),
 * which is what the old `isClientReady` flag was for.
 *
 * Replaces the `useState` + `useEffect` pair this codebase used to reach for.
 * Reading `localStorage` during render would desync server and client HTML, so
 * the effect was there to defer it — but writing state from an effect costs a
 * second render pass and trips `react-hooks/set-state-in-effect`.
 * `useSyncExternalStore` is the supported way to read external state: it hands
 * React a distinct server snapshot, so hydration matches without the round trip.
 */
export function useHasAccessToken(): boolean | null {
  return useSyncExternalStore(
    subscribeToNothing,
    () => Boolean(getAccessToken()),
    () => null,
  );
}

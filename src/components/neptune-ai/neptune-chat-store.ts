"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the compact chat panel is open, as a tiny external store.
 *
 * Two unrelated components drive the same panel — the floating launcher in AppShell and the
 * "Chat" entry in the sidebar — and they share no ancestor closer than the app shell itself.
 * Threading a context down both branches for one boolean is more machinery than the boolean;
 * a module-level store with `useSyncExternalStore` is the honest size for it.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

const getSnapshot = () => isOpen;
// The panel can only be open in a browser; the server always renders it closed.
const getServerSnapshot = () => false;

export function useNeptuneChatOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function openNeptuneChat(): void {
  if (!isOpen) {
    isOpen = true;
    emit();
  }
}

export function closeNeptuneChat(): void {
  if (isOpen) {
    isOpen = false;
    emit();
  }
}

export function toggleNeptuneChat(): void {
  isOpen = !isOpen;
  emit();
}

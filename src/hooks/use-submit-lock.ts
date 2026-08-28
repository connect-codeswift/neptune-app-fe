"use client";

import { useRef, useState } from "react";

/**
 * Keeps a submit control disabled from the first click until the page it lives
 * on is gone.
 *
 * A mutation's `isPending` is not enough on its own. It goes false the instant
 * the server answers, while `router.push` is still fetching the next route — so
 * the button re-enabled underneath the success toast and a second click filed a
 * second record. None of the create endpoints carry an idempotency key, so that
 * retry is a real duplicate rather than a no-op.
 *
 * The ref is what actually enforces the guard: a `disabled` prop cannot close
 * the window between the first click and the re-render that applies it.
 *
 * Usage — release only on failure, so a genuine retry stays possible:
 *
 * ```ts
 * const submitLock = useSubmitLock();
 *
 * const handleSubmit = async () => {
 *   if (!submitLock.acquire()) return;   // already submitting
 *   try {
 *     await createThing.mutateAsync(values);
 *     router.push(destination);          // stays locked through navigation
 *   } catch (error) {
 *     submitLock.release();              // failed, let them try again
 *     toast.error(...);
 *   }
 * };
 * ```
 *
 * Acquire *after* client-side validation: a form that failed its own checks has
 * sent nothing, so its button must stay live for the fix.
 */
export function useSubmitLock() {
  const [isLocked, setIsLocked] = useState(false);
  const lockRef = useRef(false);

  /** Takes the lock. Returns false if a submit is already under way. */
  const acquire = () => {
    if (lockRef.current) {
      return false;
    }
    lockRef.current = true;
    setIsLocked(true);
    return true;
  };

  /** Releases the lock. Call this only on a failed submit. */
  const release = () => {
    lockRef.current = false;
    setIsLocked(false);
  };

  return { isLocked, acquire, release };
}

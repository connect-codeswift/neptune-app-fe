import { afterEach, vi } from "vitest";
import { createElement } from "react";

// The real Icon pulls the Iconify runtime and fetches icon data over the network.
// Every screen in this app draws icons, so stubbing once here keeps each test about
// its own component and off the wire. The stub keeps the `icon` name queryable.
vi.mock("@iconify/react", () => ({
  Icon: ({ icon, ...rest }: { icon: string }) =>
    createElement("span", { "data-testid": "icon", "data-icon": icon, ...rest }),
}));

// The suite runs in `node` by default and files opt into jsdom individually, so the
// DOM-only setup has to be conditional — importing jest-dom without a document throws.
if (globalThis.document !== undefined) {
  await import("@testing-library/jest-dom/vitest");
  const { cleanup } = await import("@testing-library/react");

  // Unmount between tests so a query in one test cannot match a node another left behind.
  afterEach(() => {
    cleanup();
    globalThis.sessionStorage.clear();
    globalThis.localStorage.clear();
  });
}

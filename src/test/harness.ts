import { vi } from "vitest";

/**
 * Test doubles for the three browser APIs this project is built on.
 *
 * jsdom implements none of them: `matchMedia` is absent, `IntersectionObserver`
 * is absent, and `HTMLMediaElement.play`/`pause` throw "not implemented". Since
 * the media and motion systems are defined entirely by how they respond to
 * those three, they are replaced with doubles that can be driven from a test.
 */

type MediaQueryListener = (event: MediaQueryListEvent) => void;

const mediaQueryState = new Map<string, boolean>();
const mediaQueryListeners = new Map<string, Set<MediaQueryListener>>();

/** Makes a media query report `matches`, notifying anything already subscribed. */
export function setMediaQuery(query: string, matches: boolean): void {
  mediaQueryState.set(query, matches);
  const listeners = mediaQueryListeners.get(query);
  if (!listeners) return;
  const event = { matches, media: query } as MediaQueryListEvent;
  listeners.forEach((listener) => listener(event));
}

export function installMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => {
      const matches = mediaQueryState.get(query) ?? false;
      const listeners =
        mediaQueryListeners.get(query) ?? new Set<MediaQueryListener>();
      mediaQueryListeners.set(query, listeners);

      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: MediaQueryListener) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: MediaQueryListener) => {
          listeners.delete(listener);
        },
        addListener: (listener: MediaQueryListener) => listeners.add(listener),
        removeListener: (listener: MediaQueryListener) =>
          listeners.delete(listener),
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
    },
  });
}

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  disconnected: boolean;
};

const observers: ObserverRecord[] = [];

/** Number of observers currently connected — used to assert cleanup. */
export function activeObserverCount(): number {
  return observers.filter((record) => !record.disconnected).length;
}

/** Emits an intersection change for every element currently being observed. */
export function emitIntersection(isIntersecting: boolean): void {
  observers.forEach((record) => {
    if (record.disconnected || record.elements.size === 0) return;
    const entries = Array.from(record.elements).map(
      (target) =>
        ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        }) as IntersectionObserverEntry,
    );
    record.callback(entries, {} as IntersectionObserver);
  });
}

export function installIntersectionObserver(): void {
  class TestIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
    #record: ObserverRecord;

    constructor(callback: IntersectionObserverCallback) {
      this.#record = { callback, elements: new Set(), disconnected: false };
      observers.push(this.#record);
    }

    observe(element: Element): void {
      this.#record.elements.add(element);
    }

    unobserve(element: Element): void {
      this.#record.elements.delete(element);
    }

    disconnect(): void {
      this.#record.elements.clear();
      this.#record.disconnected = true;
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  for (const target of [window, globalThis]) {
    Object.defineProperty(target, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: TestIntersectionObserver,
    });
  }
}

export function installMediaElementStubs(): void {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    writable: true,
    configurable: true,
    value: vi.fn(function play(this: HTMLMediaElement) {
      Object.defineProperty(this, "paused", {
        writable: true,
        configurable: true,
        value: false,
      });
      return Promise.resolve();
    }),
  });

  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    writable: true,
    configurable: true,
    value: vi.fn(function pause(this: HTMLMediaElement) {
      Object.defineProperty(this, "paused", {
        writable: true,
        configurable: true,
        value: true,
      });
    }),
  });

  Object.defineProperty(HTMLMediaElement.prototype, "load", {
    writable: true,
    configurable: true,
    value: vi.fn(),
  });
}

/** Drives `document.visibilityState` and fires the matching event. */
export function setDocumentVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    writable: true,
    configurable: true,
    value: state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

export function resetHarness(): void {
  mediaQueryState.clear();
  mediaQueryListeners.clear();
  observers.length = 0;
  installMatchMedia();
  installIntersectionObserver();
  installMediaElementStubs();
  Object.defineProperty(document, "visibilityState", {
    writable: true,
    configurable: true,
    value: "visible",
  });
}

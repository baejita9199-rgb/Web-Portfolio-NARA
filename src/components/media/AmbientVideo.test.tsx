import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { REDUCED_MOTION_QUERY } from "@/hooks/useReducedMotion";
import { breakpoints } from "@/hooks/useMediaQuery";
import {
  activeObserverCount,
  emitIntersection,
  setDocumentVisibility,
  setMediaQuery,
} from "@/test/harness";
import { AmbientVideo } from "./AmbientVideo";

const props = {
  desktopSrc: "/nara-house/video/hero-desktop.webm",
  mobileSrc: "/nara-house/video/hero-mobile.webm",
  poster: "/nara-house/images/hero-poster-desktop.webp",
  mobilePoster: "/nara-house/images/hero-poster-mobile.webp",
  description: "Mist drifting through the valley.",
};

/** The single `<video>` an AmbientVideo renders, or null when it renders none. */
function getVideo(container: HTMLElement): HTMLVideoElement | null {
  return container.querySelector("video");
}

function sourcesOf(video: HTMLVideoElement): string[] {
  return Array.from(video.querySelectorAll("source")).map(
    (source) => source.getAttribute("src") ?? "",
  );
}

describe("AmbientVideo — playback attributes", () => {
  it("is silent, inline, looping and free of controls", () => {
    const { container } = render(<AmbientVideo {...props} />);
    const video = getVideo(container)!;

    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("loop");
    expect(video).not.toHaveAttribute("controls");
    expect(video).toHaveAttribute("aria-hidden", "true");
  });

  it("always renders the poster beneath the clip", () => {
    render(<AmbientVideo {...props} alt="Mist over the valley" />);
    expect(screen.getByAltText("Mist over the valley")).toBeInTheDocument();
  });

  it("offers a text alternative for the motion it shows", () => {
    render(<AmbientVideo {...props} />);
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });
});

describe("AmbientVideo — poster art direction", () => {
  /**
   * The crop must be decided by the browser from the markup, never by React
   * after hydration. A JS-chosen poster is the desktop one in the delivered
   * HTML, so a phone downloads the landscape still and then the portrait one
   * on top of it — and the poster is the hero's LCP element.
   */
  function posterSources(container: HTMLElement): HTMLSourceElement[] {
    return Array.from(container.querySelectorAll("picture source"));
  }

  it("offers the portrait crop through a media-gated source", () => {
    const { container } = render(<AmbientVideo {...props} priority />);
    const sources = posterSources(container);

    expect(sources).toHaveLength(1);
    expect(sources[0]!.media).toBe(breakpoints.mobile);
    expect(sources[0]!.srcset).toContain(
      encodeURIComponent(props.mobilePoster),
    );
  });

  it("offers the landscape crop on the img itself", () => {
    const { container } = render(<AmbientVideo {...props} priority />);
    const img = container.querySelector("picture img")!;

    expect(img.getAttribute("srcset")).toContain(
      encodeURIComponent(props.poster),
    );
  });

  it("picks the same markup whatever the media query currently reports", () => {
    setMediaQuery(breakpoints.mobile, true);
    const { container } = render(<AmbientVideo {...props} priority />);

    // Identical to the desktop render above: nothing here is JS-conditional.
    expect(posterSources(container)[0]!.media).toBe(breakpoints.mobile);
    expect(
      container.querySelector("picture img")!.getAttribute("srcset"),
    ).toContain(encodeURIComponent(props.poster));
  });

  it("renders no media-gated source when there is no portrait crop", () => {
    const { mobilePoster: _omitted, ...withoutPortrait } = props;
    const { container } = render(
      <AmbientVideo {...withoutPortrait} priority />,
    );

    expect(posterSources(container)).toHaveLength(0);
  });
});

describe("AmbientVideo — lazy source attachment", () => {
  it("downloads nothing until the clip approaches the viewport", () => {
    const { container } = render(<AmbientVideo {...props} />);
    const video = getVideo(container)!;

    expect(sourcesOf(video)).toHaveLength(0);
    expect(video).toHaveAttribute("preload", "none");
  });

  it("attaches sources once the clip comes into view", () => {
    const { container } = render(<AmbientVideo {...props} />);
    act(() => emitIntersection(true));

    const video = getVideo(container)!;
    expect(sourcesOf(video)).toEqual([props.desktopSrc]);
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("keeps the sources attached after the clip scrolls away", () => {
    const { container } = render(<AmbientVideo {...props} />);
    act(() => emitIntersection(true));
    act(() => emitIntersection(false));

    // Re-downloading on every pass would defeat the point of caching them.
    expect(sourcesOf(getVideo(container)!)).toEqual([props.desktopSrc]);
  });

  it("loads the hero eagerly without waiting for an intersection", () => {
    const { container } = render(<AmbientVideo {...props} priority />);
    const video = getVideo(container)!;

    expect(sourcesOf(video)).toEqual([props.desktopSrc]);
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("chooses the portrait crop on a narrow viewport", () => {
    setMediaQuery(breakpoints.mobile, true);
    const { container } = render(<AmbientVideo {...props} priority />);

    expect(sourcesOf(getVideo(container)!)).toEqual([props.mobileSrc]);
  });
});

describe("AmbientVideo — visibility behaviour", () => {
  it("does not play while the clip is off-screen", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<AmbientVideo {...props} />);

    expect(play).not.toHaveBeenCalled();
  });

  it("plays when the clip enters the viewport", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<AmbientVideo {...props} />);

    act(() => emitIntersection(true));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("pauses when the clip leaves the viewport", () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    render(<AmbientVideo {...props} />);

    act(() => emitIntersection(true));
    act(() => emitIntersection(false));

    expect(pause).toHaveBeenCalled();
  });

  it("pauses when the tab is hidden and resumes when it returns", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    render(<AmbientVideo {...props} />);

    act(() => emitIntersection(true));
    expect(play).toHaveBeenCalledTimes(1);

    act(() => setDocumentVisibility("hidden"));
    expect(pause).toHaveBeenCalled();

    act(() => setDocumentVisibility("visible"));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("does not resume a hidden tab for a clip that has scrolled away", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<AmbientVideo {...props} />);

    act(() => emitIntersection(true));
    act(() => emitIntersection(false));
    act(() => setDocumentVisibility("hidden"));
    act(() => setDocumentVisibility("visible"));

    // Playback requires being on screen *and* in a visible tab.
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("marks the clip as playing only once playback has actually begun", async () => {
    const { container } = render(<AmbientVideo {...props} />);
    const video = getVideo(container)!;
    expect(video).toHaveAttribute("data-playing", "false");

    await act(async () => {
      emitIntersection(true);
    });
    expect(video).toHaveAttribute("data-playing", "true");
  });

  it("survives a rejected play() without surfacing an error", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(
      new DOMException("NotAllowedError"),
    );
    const { container } = render(<AmbientVideo {...props} />);

    await act(async () => {
      emitIntersection(true);
    });

    // The poster simply stays visible; nothing throws and nothing is logged.
    expect(getVideo(container)).toHaveAttribute("data-playing", "false");
  });

  it("disconnects its observer on unmount", () => {
    const { unmount } = render(<AmbientVideo {...props} />);
    expect(activeObserverCount()).toBeGreaterThan(0);

    unmount();
    expect(activeObserverCount()).toBe(0);
  });
});

describe("AmbientVideo — reduced motion", () => {
  it("renders no video element at all", () => {
    setMediaQuery(REDUCED_MOTION_QUERY, true);
    const { container } = render(<AmbientVideo {...props} />);

    // Not merely paused — never created, so nothing is fetched or decoded.
    expect(getVideo(container)).toBeNull();
  });

  it("still shows the poster, so no content is lost", () => {
    setMediaQuery(REDUCED_MOTION_QUERY, true);
    render(<AmbientVideo {...props} alt="Mist over the valley" />);

    expect(screen.getByAltText("Mist over the valley")).toBeInTheDocument();
  });

  it("still offers the text alternative", () => {
    setMediaQuery(REDUCED_MOTION_QUERY, true);
    render(<AmbientVideo {...props} />);

    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it("never calls play(), even for a priority clip in view", () => {
    setMediaQuery(REDUCED_MOTION_QUERY, true);
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<AmbientVideo {...props} priority />);

    act(() => emitIntersection(true));
    expect(play).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import imageLoader, { unsplashUrl } from "@/lib/imageLoader";

const SRC = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=600&fit=crop";

describe("imageLoader", () => {
  it("requests the width next/image asks for, in a modern format", () => {
    const url = new URL(imageLoader({ src: SRC, width: 384 }));
    expect(url.searchParams.get("w")).toBe("384");
    expect(url.searchParams.get("auto")).toBe("format");
    expect(url.searchParams.get("q")).toBe("70");
  });

  it("keeps the original crop aspect ratio instead of a fixed height", () => {
    const url = new URL(unsplashUrl(SRC, 1200));
    expect(url.searchParams.get("ar")).toBe("800:600");
    expect(url.searchParams.has("h")).toBe(false);
    expect(url.searchParams.get("fit")).toBe("crop");
  });

  it("passes through quality", () => {
    expect(new URL(imageLoader({ src: SRC, width: 640, quality: 50 })).searchParams.get("q")).toBe("50");
  });

  it("leaves non-Unsplash URLs untouched", () => {
    expect(imageLoader({ src: "/local.png", width: 640 })).toBe("/local.png");
    expect(imageLoader({ src: "https://example.com/a.jpg", width: 640 })).toBe("https://example.com/a.jpg");
  });
});

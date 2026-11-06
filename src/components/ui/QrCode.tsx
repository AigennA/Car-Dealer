import { useMemo } from "react";
import QRCode from "qrcode";

/**
 * A QR code drawn as one SVG path, computed synchronously (no canvas, works in
 * the static HTML). Shown with a text alternative, never as the only way to
 * get the information (WCAG 1.1.1).
 */
export function QrCode({ value, label, size = 168 }: { value: string; label: string; size?: number }) {
  const { path, cells } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    const n = modules.size;
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (modules.get(y, x)) d += `M${x + 2} ${y + 2}h1v1h-1z`;
    return { path: d, cells: n + 4 }; // 2-module quiet zone
  }, [value]);

  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox={`0 0 ${cells} ${cells}`}
      shapeRendering="crispEdges" className="rounded-lg bg-white">
      <rect width={cells} height={cells} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}

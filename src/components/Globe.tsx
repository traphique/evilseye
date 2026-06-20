"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import type { ThreatEvent } from "@/lib/types";
import { severityColor } from "@/lib/severity";

interface GlobeProps {
  threats: ThreatEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function Globe({ threats, selectedId, onSelect }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const threatsRef = useRef(threats);
  const selectedRef = useRef(selectedId);

  useEffect(() => {
    threatsRef.current = threats;
    selectedRef.current = selectedId;
  }, [threats, selectedId]);

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) width = canvasRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.08, 0.12, 0.18],
      markerColor: [0.2, 0.8, 1],
      glowColor: [0.1, 0.3, 0.5],
      markers: [],
      onRender: (state: Record<string, unknown>) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.003;
        }
        state.phi = phiRef.current + pointerInteractionMovement.current;
        state.width = width * 2;
        state.height = width * 2;

        state.markers = threatsRef.current.map((t) => {
          const isSelected = t.id === selectedRef.current;
          const color = hexToRgb(severityColor(t.severity));
          return {
            location: [t.lat, t.lng] as [number, number],
            size: isSelected ? 0.12 : t.severity === "critical" ? 0.08 : 0.05,
            color: isSelected ? [1, 0.3, 0.3] : [color[0] / 255, color[1] / 255, color[2] / 255],
          };
        });
      },
    } as COBEOptions);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (threats.length === 0) return;
    const idx = Math.floor(
      ((e.clientX % threats.length) + threats.length) % threats.length,
    );
    onSelect(threats[idx].id);
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta / 200;
          }
        }}
        onClick={handleClick}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,10,20,0.8)_100%)]" />
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-cyan-500/20 bg-black/40 px-3 py-2 text-xs text-cyan-200/80 backdrop-blur">
        {threats.length} active markers · drag to rotate
      </div>
    </div>
  );
}
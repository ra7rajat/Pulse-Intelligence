'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Zone, ZoneStatus } from '@core/entities';
import { StaffUnit } from '@/hooks/useStadiumPulse';
import { useMap } from './MapBoundary';

interface Props {
  zones: Zone[];
  staff: StaffUnit[];
  mode: '3D' | 'heatmap' | 'staff';
}

/* ─── Color helpers ─── */
function statusColor(status: ZoneStatus): string {
  switch (status) {
    case ZoneStatus.CRITICAL: return '#ef4444';
    case ZoneStatus.CROWDED: return '#f59e0b';
    case ZoneStatus.MODERATE: return '#3b82f6';
    default: return '#10b981';
  }
}

function hexRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ─── Geo helpers ─── */
const STADIUM_CENTER = { lat: 12.9789, lng: 77.5997 };

function geoToCanvas(lat: number, lng: number, cx: number, cy: number, scale: number) {
  const dx = (lng - STADIUM_CENTER.lng) * scale;
  const dy = -(lat - STADIUM_CENTER.lat) * scale;
  return { x: cx + dx, y: cy + dy };
}

/* ═══ COMPONENT ═══ */
export default function StadiumOverlay({ zones, staff, mode }: Props) {
  const { map } = useMap();
  const hasMap = !!map;
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  // Control map camera when mode changes
  useEffect(() => {
    if (!map) return;
    if (mode === 'heatmap') {
      map.setTilt(0);
      map.setHeading(0);
      map.setZoom(18);
    } else {
      map.setTilt(55);
      map.setHeading(30);
      map.setZoom(18);
    }
  }, [mode, map]);

  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const p = c.parentElement;
      if (!p) return;
      W = p.clientWidth;
      H = p.clientHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const t0 = performance.now();

    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const scale = Math.min(W, H) * 120000;

      // Ensure points stick perfectly to the map when dragging/tilting using OverlayView.
      // NOTE: fromLatLngToContainerPixel returns CSS-space coordinates (no DPR factor).
      // We apply ctx.setTransform(dpr,...) so canvas draws in logical pixels — do NOT multiply by dpr here.
      let getPixel = (lat: number, lng: number) => geoToCanvas(lat, lng, cx, cy, scale);
      
      if (hasMap && window.google) {
        // Create or reuse a projection overlay anchored to the current map instance
        const existingOv = window.__pulseMapOverlay;
        if (!existingOv || existingOv.__map !== map) {
          // Clean up stale overlay from a previous map instance
          if (existingOv) {
            try { existingOv.setMap(null); } catch (_) {}
          }
          class ProjOverlay extends window.google.maps.OverlayView {
            onAdd() {} draw() {} onRemove() {}
          }
          const ov = new ProjOverlay() as any;
          ov.__map = map;
          ov.setMap(map);
          window.__pulseMapOverlay = ov;
        }
        
        getPixel = (lat: number, lng: number) => {
          const ov = window.__pulseMapOverlay;
          if (ov) {
            const proj = ov.getProjection();
            if (proj) {
              // fromLatLngToContainerPixel returns logical (CSS) pixel coordinates.
              // ctx is already scaled by dpr via setTransform, so use values as-is.
              const pt = proj.fromLatLngToContainerPixel(new window.google.maps.LatLng(lat, lng));
              if (pt) return { x: pt.x, y: pt.y };
            }
          }
          return geoToCanvas(lat, lng, cx, cy, scale);
        };
      }

      const drawBgLayer = (mapOpacity: number) => {
        if (!hasMap) drawDarkBg(ctx, W, H, t);
        else { ctx.fillStyle = `rgba(2,6,23,${mapOpacity})`; ctx.fillRect(0, 0, W, H); }
      };

      if (mode === '3D') {
        drawBgLayer(0.2);
        draw3DOverlay(ctx, W, H, getPixel, t, zones);
      } else if (mode === 'heatmap') {
        // Map MUST be visible in heatmap mode, just darkened slightly
        drawBgLayer(0.45);
        drawHeatmap2D(ctx, W, H, getPixel, t, zones);
      } else {
        drawBgLayer(0.25);
        drawStaffHub(ctx, W, H, getPixel, t, staff, zones);
      }

      raf.current = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      // Only destroy the overlay when unmounting the component entirely
      const ov = window.__pulseMapOverlay;
      if (ov) {
        try { ov.setMap(null); } catch (_) {}
        delete window.__pulseMapOverlay;
      }
    };
  }, [mode, zones, staff, hasMap, map]);

  return <canvas ref={cvs} className="absolute inset-0 z-[2]" style={{ pointerEvents: 'none' }} />;
}

/* ═══════════════════════════════════════════════════════
   DRAWING FUNCTIONS
   ═══════════════════════════════════════════════════════ */

function drawDarkBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.5);
  g.addColorStop(0, 'rgba(15,23,42,0.5)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/* ─── 3D MODE: Heatmap overlaid on tilted satellite ─── */
function draw3DOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, getPixel: (lat: number, lng: number) => {x: number, y: number}, t: number, zones: Zone[]) {
  for (const zone of zones) {
    const p = getPixel(zone.coordinates.lat, zone.coordinates.lng);
    const sat = zone.capacity > 0 ? zone.occupancy / zone.capacity : 0;
    const color = statusColor(zone.status);
    const radius = 30 + sat * 50;
    const pulse = 1 + Math.sin(t * 1.5) * 0.08;

    // Heatmap glow
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * pulse * 1.5);
    g.addColorStop(0, hexRgba(color, 0.55));
    g.addColorStop(0.4, hexRgba(color, 0.25));
    g.addColorStop(0.7, hexRgba(color, 0.08));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Label card
    const pct = `${Math.round(sat * 100)}%`;
    ctx.font = 'bold 10px system-ui, sans-serif';
    const tw = ctx.measureText(zone.name).width;
    const bw = Math.max(tw, 60) + 20;
    const bx = p.x - bw / 2, by = p.y - radius - 40;

    ctx.fillStyle = 'rgba(2,6,23,0.85)';
    roundRect(ctx, bx, by, bw, 34, 8);
    ctx.fill();
    ctx.strokeStyle = hexRgba(color, 0.6);
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, bw, 34, 8);
    ctx.stroke();

    // Section name
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText(zone.name.toUpperCase(), p.x, by + 12);

    // Percentage + count
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(`${pct}  ·  ${zone.occupancy.toLocaleString()}/${zone.capacity.toLocaleString()}`, p.x, by + 25);

    // Leader line
    ctx.beginPath();
    ctx.moveTo(p.x, by + 34);
    ctx.lineTo(p.x, p.y - 5);
    ctx.strokeStyle = hexRgba(color, 0.3);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  drawHUD(ctx, w, h, t);
}

/* ─── HEATMAP MODE: 2D map overlay ─── */
function drawHeatmap2D(ctx: CanvasRenderingContext2D, w: number, h: number, getPixel: (lat: number, lng: number) => {x: number, y: number}, t: number, zones: Zone[]) {
  // Draw full-canvas grid slightly for tactical feel
  ctx.strokeStyle = 'rgba(99,102,241,0.03)';
  ctx.lineWidth = 0.5;
  for (let x = 40; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 40; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Heat zones — geographically placed on the live map
  zones.forEach((zone, i) => {
    const p = getPixel(zone.coordinates.lat, zone.coordinates.lng);
    const sat = zone.capacity > 0 ? zone.occupancy / zone.capacity : 0;
    const color = statusColor(zone.status);
    // Blobs are larger in heatmap mode
    const blobR = 50 + sat * 70;
    const pulse = 1 + Math.sin(t * 1.2 + i * 1.5) * 0.06;

    // Multi-layer heat blob
    [1.6, 1.0, 0.4].forEach((layerScale, li) => {
      const lr = blobR * layerScale * pulse;
      const alphas = [0.25, 0.45, 0.75];
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, lr);
      if (li === 2) {
        g.addColorStop(0, 'rgba(255,255,255,0.7)');
        g.addColorStop(0.5, hexRgba(color, alphas[li]));
      } else {
        g.addColorStop(0, hexRgba(color, alphas[li]));
      }
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, lr, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sub-blob hex grid
    const hexSize = 8;
    ctx.strokeStyle = hexRgba(color, 0.2);
    ctx.lineWidth = 0.5;
    for (let row = -5; row <= 5; row++) {
      for (let col = -5; col <= 5; col++) {
        const hx = p.x + col * hexSize * Math.sqrt(3) + (row % 2 === 0 ? 0 : hexSize * Math.sqrt(3) / 2);
        const hy = p.y + row * hexSize * 1.5;
        if (Math.sqrt((hx - p.x) ** 2 + (hy - p.y) ** 2) > blobR * 0.8) continue;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k - Math.PI / 6;
          const vx = hx + hexSize * 0.6 * Math.cos(a);
          const vy = hy + hexSize * 0.6 * Math.sin(a);
          k === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Label
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(zone.name.toUpperCase(), p.x, p.y - blobR - 14);

    // Percentage badge
    const pct = `${Math.round(sat * 100)}%`;
    ctx.font = 'bold 16px system-ui, sans-serif';
    const ptw = ctx.measureText(pct).width;
    ctx.fillStyle = 'rgba(2,6,23,0.75)';
    roundRect(ctx, p.x - ptw / 2 - 10, p.y - 12, ptw + 20, 26, 8);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(pct, p.x, p.y + 4);

    // Capacity text
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.fillText(`${zone.occupancy.toLocaleString()} / ${zone.capacity.toLocaleString()}`, p.x, p.y + 18);
  });

  // Scanning radar sweep around canvas center (aesthetic only)
  const cx = w/2, cy = h/2;
  const scanPhase = (t * 0.15) % 1;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(w,h) * scanPhase, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(99,102,241,${0.1 * (1 - scanPhase)})`;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Legend
  const legendX = 30, legendY = h - 80;
  const legendColors = [
    { label: 'CLEAR', color: '#10b981' },
    { label: 'MODERATE', color: '#3b82f6' },
    { label: 'CROWDED', color: '#f59e0b' },
    { label: 'CRITICAL', color: '#ef4444' },
  ];
  ctx.font = 'bold 8px system-ui, sans-serif';
  legendColors.forEach((lc, i) => {
    const ly = legendY + i * 16;
    ctx.beginPath();
    ctx.arc(legendX + 5, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = lc.color;
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.fillText(lc.label, legendX + 14, ly + 3);
  });

  // Gradient density bar
  const barX = w - 190, barY = h - 40, barW = 150, barH = 8;
  const bg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  bg.addColorStop(0, '#10b981'); bg.addColorStop(0.4, '#3b82f6'); bg.addColorStop(0.7, '#f59e0b'); bg.addColorStop(1, '#ef4444');
  ctx.fillStyle = bg;
  roundRect(ctx, barX, barY, barW, barH, 4);
  ctx.fill();
  ctx.font = '7px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(148,163,184,0.5)';
  ctx.textAlign = 'left';
  ctx.fillText('Low', barX, barY - 4);
  ctx.textAlign = 'right';
  ctx.fillText('High', barX + barW, barY - 4);
  ctx.textAlign = 'center';
  ctx.fillText('CROWD DENSITY', barX + barW / 2, barY + barH + 12);

  drawHUD(ctx, w, h, t);
}

/* ─── STAFF HUB: Rich tactical tracking ─── */
function drawStaffHub(ctx: CanvasRenderingContext2D, w: number, h: number, getPixel: (lat: number, lng: number) => {x: number, y: number}, t: number, staff: StaffUnit[], zones: Zone[]) {
  const typeColor: Record<string, string> = {
    security: '#6366f1',
    medical: '#ef4444',
    steward: '#10b981',
  };

  // Coverage circles per staff
  staff.forEach((unit) => {
    const p = getPixel(unit.coordinates.lat, unit.coordinates.lng);
    const color = typeColor[unit.type] || '#6366f1';
    const coverageR = unit.type === 'security' ? 45 : unit.type === 'medical' ? 55 : 35;

    ctx.beginPath();
    ctx.arc(p.x, p.y, coverageR, 0, Math.PI * 2);
    ctx.fillStyle = hexRgba(color, 0.06);
    ctx.fill();
    ctx.strokeStyle = hexRgba(color, 0.12);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Staff pins with rich info
  staff.forEach((unit, i) => {
    const p = getPixel(unit.coordinates.lat, unit.coordinates.lng);
    const color = typeColor[unit.type] || '#6366f1';
    const statusClr = unit.status === 'active' ? '#10b981' : unit.status === 'responding' ? '#f59e0b' : '#64748b';

    // Animated detection ring
    const ringPhase = (t * 0.5 + i * 0.4) % 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8 + ringPhase * 20, 0, Math.PI * 2);
    ctx.strokeStyle = hexRgba(color, 0.25 * (1 - ringPhase));
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pin
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Status dot
    ctx.beginPath();
    ctx.arc(p.x + 6, p.y - 6, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#020617';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x + 6, p.y - 6, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = statusClr;
    ctx.fill();

    // Info card
    const cardW = 140, cardH = 50;
    const cardX = p.x - cardW / 2;
    const cardY = p.y - 70;

    ctx.fillStyle = 'rgba(2,6,23,0.9)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.strokeStyle = hexRgba(color, 0.4);
    ctx.lineWidth = 1;
    roundRect(ctx, cardX, cardY, cardW, cardH, 8);
    ctx.stroke();

    // Name + role
    ctx.textAlign = 'left';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(unit.name, cardX + 8, cardY + 14);

    ctx.font = '8px system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(unit.type.toUpperCase() + ` · ${unit.radio}`, cardX + 8, cardY + 26);

    // Zone + response time
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.fillText(`Zone: ${unit.assignedZone}`, cardX + 8, cardY + 38);

    const rtLabel = unit.status === 'standby' ? 'STANDBY' : `${unit.responseTime}s`;
    ctx.textAlign = 'right';
    ctx.fillStyle = statusClr;
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText(rtLabel, cardX + cardW - 8, cardY + 14);

    // Last check-in
    const ago = Math.round((Date.now() - unit.lastCheckIn) / 1000);
    ctx.font = '7px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText(`${ago}s ago`, cardX + cardW - 8, cardY + 26);

    // Leader line
    ctx.beginPath();
    ctx.moveTo(p.x, cardY + cardH);
    ctx.lineTo(p.x, p.y - 8);
    ctx.strokeStyle = hexRgba(color, 0.25);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Staff summary panel (bottom-left)
  const panelX = 20, panelY = h - 110, panelW = 180, panelH = 90;
  ctx.fillStyle = 'rgba(2,6,23,0.85)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(99,102,241,0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 10);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillStyle = '#6366f1';
  ctx.fillText('DEPLOYMENT STATUS', panelX + 12, panelY + 18);

  const active = staff.filter(s => s.status === 'active').length;
  const responding = staff.filter(s => s.status === 'responding').length;
  const standby = staff.filter(s => s.status === 'standby').length;

  ctx.font = '8px system-ui, sans-serif';
  const rows = [
    { label: `Active: ${active}`, color: '#10b981' },
    { label: `Responding: ${responding}`, color: '#f59e0b' },
    { label: `Standby: ${standby}`, color: '#64748b' },
    { label: `Total: ${staff.length}`, color: '#e2e8f0' },
  ];
  rows.forEach((row, i) => {
    ctx.beginPath();
    ctx.arc(panelX + 18, panelY + 34 + i * 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = row.color;
    ctx.fill();
    ctx.fillStyle = 'rgba(226,232,240,0.7)';
    ctx.fillText(row.label, panelX + 26, panelY + 37 + i * 14);
  });

  // Legend
  const legendX = 20, legendY = h - 140;
  [{ l: 'SECURITY', c: '#6366f1' }, { l: 'MEDICAL', c: '#ef4444' }, { l: 'STEWARD', c: '#10b981' }].forEach((t, i) => {
    ctx.beginPath();
    ctx.arc(legendX + 5 + i * 70, legendY, 3, 0, Math.PI * 2);
    ctx.fillStyle = t.c;
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.font = 'bold 7px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.fillText(t.l, legendX + 12 + i * 70, legendY + 3);
  });

  drawHUD(ctx, w, h, t);
}

/* ─── HUD ─── */
function drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const m = 12, bLen = 18;
  ctx.strokeStyle = 'rgba(99,102,241,0.15)';
  ctx.lineWidth = 1;

  // Corner brackets
  ctx.beginPath(); ctx.moveTo(m, m + bLen); ctx.lineTo(m, m); ctx.lineTo(m + bLen, m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - m - bLen, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + bLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m, h - m - bLen); ctx.lineTo(m, h - m); ctx.lineTo(m + bLen, h - m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - m - bLen, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - bLen); ctx.stroke();

  // Timestamp
  const ts = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(148,163,184,0.35)';
  ctx.fillText(ts, w - m - 4, h - m - 4);
}

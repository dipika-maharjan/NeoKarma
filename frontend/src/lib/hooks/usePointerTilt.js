import { useRef, useEffect } from 'react';

export default function usePointerTilt({ max = 8, scale = 1.02 } = {}) {
  const ref = useRef(null);
  const frame = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : (e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX));
      const clientY = e.touches ? e.touches[0].clientY : (e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY));
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 2 * max; // left/right
      const rotateX = -(py - 0.5) * 2 * max; // up/down
      const translateY = -Math.abs(py - 0.5) * 8; // small lift

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) scale(${scale})`;
      });
    };

    const handleLeave = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      el.style.transform = '';
    };

    // Pointer events (preferred), fallback to mouse/touch
    if (window.PointerEvent) {
      el.addEventListener('pointermove', handleMove);
      el.addEventListener('pointerdown', handleMove);
      el.addEventListener('pointerup', handleLeave);
      el.addEventListener('pointercancel', handleLeave);
      el.addEventListener('pointerleave', handleLeave);
    } else {
      el.addEventListener('mousemove', handleMove);
      el.addEventListener('mousedown', handleMove);
      el.addEventListener('mouseleave', handleLeave);
      el.addEventListener('mouseup', handleLeave);
      el.addEventListener('touchstart', handleMove, { passive: true });
      el.addEventListener('touchmove', handleMove, { passive: true });
      el.addEventListener('touchend', handleLeave);
      el.addEventListener('touchcancel', handleLeave);
    }

    return () => {
      if (window.PointerEvent) {
        el.removeEventListener('pointermove', handleMove);
        el.removeEventListener('pointerdown', handleMove);
        el.removeEventListener('pointerup', handleLeave);
        el.removeEventListener('pointercancel', handleLeave);
        el.removeEventListener('pointerleave', handleLeave);
      } else {
        el.removeEventListener('mousemove', handleMove);
        el.removeEventListener('mousedown', handleMove);
        el.removeEventListener('mouseleave', handleLeave);
        el.removeEventListener('mouseup', handleLeave);
        el.removeEventListener('touchstart', handleMove);
        el.removeEventListener('touchmove', handleMove);
        el.removeEventListener('touchend', handleLeave);
        el.removeEventListener('touchcancel', handleLeave);
      }
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [max, scale]);

  return ref;
}

import { useEffect, useRef } from "react";

export function useNonPassiveWheel<T extends HTMLElement>() {
  const elRef = useRef<T | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const setRef = (node: T | null) => {
    if (node === elRef.current) return;
    cleanupRef.current?.();
    cleanupRef.current = null;
    elRef.current = node;
    if (!node) return;

    const onWheel = (e: WheelEvent) => {
      const atTop = node.scrollTop === 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return;
      node.scrollTop += e.deltaY;
      e.preventDefault();
      e.stopPropagation();
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    cleanupRef.current = () => node.removeEventListener("wheel", onWheel);
  };

  return setRef;
}

export function useNonPassiveScroll<T extends HTMLElement>() {
  const elRef = useRef<T | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const lastYRef = useRef(0);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const setRef = (node: T | null) => {
    if (node === elRef.current) return;
    cleanupRef.current?.();
    cleanupRef.current = null;
    elRef.current = node;
    if (!node) return;

    const canScroll = () => node.scrollHeight > node.clientHeight;
    const atTop = () => node.scrollTop <= 0;
    const atBottom = () => node.scrollTop + node.clientHeight >= node.scrollHeight - 1;

    const onWheel = (e: WheelEvent) => {
      if (!canScroll()) return;
      if ((e.deltaY < 0 && atTop()) || (e.deltaY > 0 && atBottom())) return;
      node.scrollTop += e.deltaY;
      e.preventDefault();
      e.stopPropagation();
    };

    const onTouchStart = (e: TouchEvent) => {
      lastYRef.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!canScroll()) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = lastYRef.current - y;
      lastYRef.current = y;
      if ((delta < 0 && atTop()) || (delta > 0 && atBottom())) return;
      node.scrollTop += delta;
      e.preventDefault();
      e.stopPropagation();
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    cleanupRef.current = () => {
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
    };
  };

  return setRef;
}

import { useEffect, useRef } from "react";

/**
 * Manual wheel forwarding so a scrollable element keeps scrolling inside
 * modal popovers/dialogs, where react-remove-scroll swallows wheel events.
 * React registers `onWheel` passively (preventDefault() is ignored there and
 * Chrome warns "Unable to preventDefault inside passive event listener"), so
 * the handler must be a native listener attached with `passive: false`.
 *
 * Returns a ref callback to attach to the scrollable element.
 */
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

/**
 * Like {@link useNonPassiveWheel} but also forwards touch scrolling, so a list
 * scrolls on mobile inside modal popovers/dialogs where react-remove-scroll
 * swallows `touchmove` the same way it swallows `wheel`. Manually drives
 * `scrollTop` and only consumes the gesture while there's room to scroll, so at
 * the boundaries the parent/modal still behaves normally.
 *
 * Returns a ref callback to attach to the scrollable element.
 */
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
      const delta = lastYRef.current - y; // finger up → positive → scroll down
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

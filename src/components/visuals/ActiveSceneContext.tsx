"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ActiveSceneValue = {
  activeId: string | null;
  register: (id: string, el: HTMLElement) => void;
  unregister: (id: string) => void;
  /** Claim the single WebGL slot; returns false while another scene holds it. */
  acquire: (id: string) => boolean;
  release: (id: string) => void;
};

const Ctx = createContext<ActiveSceneValue | null>(null);

/**
 * ActiveSceneProvider — guarantees at most ONE section scene is mounted at a
 * time. Browsers cap concurrent WebGL contexts (and each heavy scene costs real
 * GPU memory), so rather than keeping every section's canvas alive we mount only
 * the section closest to the centre of the viewport and hand off as you scroll.
 */
export function ActiveSceneProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const registry = useRef(new Map<string, HTMLElement>());
  /* Only one scene may hold a live WebGL context at a time. The ref is the
     source of truth; the state exists solely to re-render consumers when the
     holder changes. */
  const holder = useRef<string | null>(null);
  const [, setHolder] = useState<string | null>(null);

  const pick = useCallback(() => {
    let bestId: string | null = null;
    let bestDist = Infinity;
    const mid = window.innerHeight / 2;
    registry.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      /* Only consider elements whose box actually intersects the viewport. */
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const center = r.top + Math.min(r.height, window.innerHeight) / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    });
    setActiveId((prev) => {
      /* When the winner changes, immediately free the WebGL slot so the new
         scene can claim it on its next effect pass. Without this the previous
         holder would linger, and two contexts could briefly coexist. */
      if (
        prev !== bestId &&
        holder.current !== null &&
        holder.current !== bestId
      ) {
        holder.current = null;
      }
      return bestId;
    });
  }, []);

  useEffect(() => {
    /* Lenis does not always emit native window scroll events, so we poll on a
       requestAnimationFrame loop instead — cheap (one rect read per registered
       scene) and correct regardless of the scroll library in use. */
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const y = Math.round(window.scrollY);
      if (y !== last) {
        last = y;
        pick();
      }
    };
    raf = requestAnimationFrame(tick);
    pick();
    return () => cancelAnimationFrame(raf);
  }, [pick]);

  const register = useCallback(
    (id: string, el: HTMLElement) => {
      registry.current.set(id, el);
      pick();
    },
    [pick],
  );

  const unregister = useCallback(
    (id: string) => {
      registry.current.delete(id);
      if (holder.current === id) {
        holder.current = null;
        setHolder(null);
      }
      pick();
    },
    [pick],
  );

  const acquire = useCallback((id: string) => {
    if (holder.current === null || holder.current === id) {
      holder.current = id;
      setHolder(id);
      return true;
    }
    return false;
  }, []);

  const release = useCallback((id: string) => {
    if (holder.current === id) {
      holder.current = null;
      setHolder(null);
    }
  }, []);

  return (
    <Ctx.Provider value={{ activeId, register, unregister, acquire, release }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActiveScene() {
  return useContext(Ctx);
}

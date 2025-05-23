import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [
  (node?: Element | null) => void,
  IntersectionObserverEntry | undefined,
  () => void,
] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  const disconnect = () => {
    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.disconnect();
    }
  };

  useEffect(() => {
    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.disconnect();
    }

    if (frozen || !node) return;

    observer.current = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });

    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, root, rootMargin, frozen]);

  const setNodeRef = (node?: Element | null) => {
    setNode(node ?? null);
  };

  return [setNodeRef, entry, disconnect];
}

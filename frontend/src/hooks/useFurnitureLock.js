import { useState, useCallback } from "react";

/**
 * 가구 잠금 훅 (5번 기능)
 * lockedIds: Set<instanceId>
 */
export function useFurnitureLock() {
  const [lockedIds, setLockedIds] = useState(new Set());

  const lock = useCallback((instanceId) => {
    setLockedIds((prev) => new Set([...prev, instanceId]));
  }, []);

  const unlock = useCallback((instanceId) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      next.delete(instanceId);
      return next;
    });
  }, []);

  const toggleLock = useCallback((instanceId) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      next.has(instanceId) ? next.delete(instanceId) : next.add(instanceId);
      return next;
    });
  }, []);

  const isLocked = useCallback(
    (instanceId) => lockedIds.has(instanceId),
    [lockedIds]
  );

  return { lockedIds, lock, unlock, toggleLock, isLocked };
}
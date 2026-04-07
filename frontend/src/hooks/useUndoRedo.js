import { useRef, useCallback } from "react";

/**
 * 무한 Undo/Redo 훅 (14번 기능)
 * snapshot: 저장할 상태 객체
 * restore:  (snapshot) => void  — 상태 복원 함수
 */
export function useUndoRedo() {
  const historyRef = useRef([]);
  const futureRef  = useRef([]);

  const save = useCallback((snapshot) => {
    historyRef.current.push(snapshot);
    futureRef.current = [];
  }, []);

  const undo = useCallback((currentSnapshot, restore) => {
    if (!historyRef.current.length) return;
    futureRef.current.push(currentSnapshot);
    restore(historyRef.current.pop());
  }, []);

  const redo = useCallback((currentSnapshot, restore) => {
    if (!futureRef.current.length) return;
    historyRef.current.push(currentSnapshot);
    restore(futureRef.current.pop());
  }, []);

  const canUndo = () => historyRef.current.length > 0;
  const canRedo = () => futureRef.current.length > 0;

  return { save, undo, redo, canUndo, canRedo };
}
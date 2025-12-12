// src/utils/hooks/useToggle.ts

import { useState, useCallback } from 'react';

/**
 * Hook สำหรับจัดการ boolean state แบบ toggle
 *
 * @param initialValue - ค่าเริ่มต้น (default: false)
 * @returns [state, toggle, setTrue, setFalse]
 *
 * @example
 * const [isOpen, toggle, open, close] = useToggle(false);
 *
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={open}>Open</button>
 * <button onClick={close}>Close</button>
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
}

export default useToggle;

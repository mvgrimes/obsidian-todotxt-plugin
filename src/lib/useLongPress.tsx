import React, { useState, useRef, useCallback } from 'react';

type useLongPressType = (
  onLongPress: (event: any) => void,
  onClick: (event: any) => void,
  options?: {
    delay?: number;
  },
) => {
  onMouseDown: (event: any) => void;
  onTouchStart: (event: any) => void;
  onMouseUp: (event: any) => void;
  onMouseLeave: (event: any) => void;
  onTouchEnd: (event: any) => void;
};
const useLongPress: useLongPressType = (
  onLongPress,
  onClick,
  { delay = 500 } = {},
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<any>();

  const start = useCallback(
    (event: React.MouseEvent) => {
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay],
  );

  const clear = useCallback(
    (event: React.MouseEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      if (shouldTriggerClick && !longPressTriggered) {
        onClick(event);
      }
      setLongPressTriggered(false);
    },
    [onClick, longPressTriggered],
  );

  return {
    onMouseDown: (e) => start(e),
    onTouchStart: (e) => start(e),
    onMouseUp: (e) => clear(e),
    onMouseLeave: (e) => clear(e, false),
    onTouchEnd: (e) => clear(e),
  };
};

export default useLongPress;

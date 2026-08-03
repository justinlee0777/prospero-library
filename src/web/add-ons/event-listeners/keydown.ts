import { BookEventListener } from './models.js';

/**
 * @returns a no-args function that destroys the listener.
 */
export const changeOnArrowKeys: BookEventListener<KeyboardEvent> = ({
  event,
  increment,
  decrement,
}) => {
  const keyCode = event.code;

  switch (keyCode) {
    case 'ArrowRight':
    case 'ArrowDown':
      increment();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      decrement();
      break;
  }
};

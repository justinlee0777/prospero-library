import type { BookEventListener } from '../../components/Book';

export const turnPageOnClick: BookEventListener<MouseEvent> = ({
  event,
  increment,
  decrement,
  bookElement,
}) => {
  const eventTarget = event.target;

  if ((eventTarget as HTMLElement)['tagName'] === 'A') {
    // Do nothing if an anchor tag is clicked on.
    return;
  }

  const { x, width } = bookElement.getBoundingClientRect();
  const midpoint = x + width / 2;
  if (event.clientX >= midpoint) {
    increment();
  } else {
    decrement();
  }
};

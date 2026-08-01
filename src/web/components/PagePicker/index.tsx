import './PagePicker.css';

import clsx from 'clsx';

interface Props {
  className?: string;
  onPageChange?: (value: number) => void;
  onClick?: (event: MouseEvent) => void;
}

export function PagePicker({ onPageChange, onClick, className }: Props) {
  const update = (event: Event) => {
    const pagePicker = event.target as HTMLInputElement;

    if (pagePicker.value.match(/^\d+$/)) {
      onPageChange?.(Number(pagePicker.value));
    }
  };

  return (
    <input
      class={clsx('pagePicker', className)}
      name="prosperoPagePicker"
      minlength={1}
      step={1}
      aria-label="Type in the page number and the book will flip to it."
      onBlur={update}
      onClick={onClick}
      onKeyDown={(event) => {
        switch (event.key) {
          case 'Enter':
            update(event);
            break;
        }
      }}
    />
  );
}

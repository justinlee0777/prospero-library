import './Lamina.css';

import clsx from 'clsx';
import { createSignal, JSX } from 'solid-js';

interface Props {
  children?: JSX.Element;
  ref?: HTMLDivElement;
}

export function Lamina({ children, ref }: Props) {
  const [focused, setFocused] = createSignal(false);

  return (
    <div
      class={clsx('lamina', {
        laminaActive: focused(),
      })}
      ref={ref}
      onFocusIn={() => setFocused(true)}
      onFocusOut={() => {
        setFocused(false);
      }}
    >
      {children}
    </div>
  );
}

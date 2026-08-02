import './LoadingIcon.css';

import clsx from 'clsx';

interface Props {
  className?: string;
}

export function LoadingIcon({ className }: Props) {
  return <div class={clsx('loadingIcon', className)}></div>;
}

import type { JSX } from 'solid-js/jsx-runtime';
import clsx from 'clsx';

export interface PageContent {
  number: number;
  content: string;
}

export interface PageProps {
  page: PageContent;
  styles: JSX.CSSProperties;

  className?: string;
}

export function Page({ page, styles, className }: PageProps) {
  return (
    <div class={clsx('page', className)} style={{ ...styles }}>
      <div innerHTML={page.content}></div>
      <span class="pageNumber">{page.number + 1}</span>
    </div>
  );
}

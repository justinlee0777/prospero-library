import type { JSX } from 'solid-js/jsx-runtime';

export interface PageContent {
  number: number;
  content: string;
}

export interface PageProps {
  page: PageContent;
  styles: JSX.CSSProperties;
}

export function Page({ page, styles }: PageProps) {
  return <div class="page" style={{ ...styles }} innerHTML={page.content} />;
}

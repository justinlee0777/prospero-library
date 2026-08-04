import { Show } from 'solid-js';
import './TableOfContents.css';

import clsx from 'clsx';

export interface TableOfContentsSection {
  title: string;
  pageNumber: number;
}

export interface TableOfContentsProps {
  sections: Array<TableOfContentsSection>;
  opened: () => boolean;

  classes?: {
    trigger?: string;
    list?: string;
  };
  onSectionSelected?: (section: TableOfContentsSection) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function TableOfContents({
  sections,
  opened,
  classes,
  onOpen,
  onClose,
  onSectionSelected,
}: TableOfContentsProps) {
  return (
    <>
      <button
        class={clsx('tableOfContentsButton', classes?.trigger)}
        onClick={(event) => {
          event.stopPropagation();
          onOpen?.();
        }}
      >
        &#9776;
      </button>
      <Show when={opened()}>
        <ul
          class={clsx('tableOfContents', classes?.list)}
          ref={(element) => {
            requestAnimationFrame(async () => {
              element.style.opacity = '0';
              element.style.translate = '-100%';

              await element.animate([{ opacity: 1, translate: '0' }], {
                duration: 300,
                fill: 'forwards',
              }).finished;

              element.style.opacity = '1';
              element.style.translate = '0';
            });
          }}
        >
          <li class="closeTableOfContents">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onClose?.();
              }}
            >
              ←
            </button>
          </li>
          {sections.map((section) => {
            const { title, pageNumber } = section;

            return (
              <li class="tableOfContentsSection">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSectionSelected?.(section);
                  }}
                >{`${title} (${pageNumber + 1})`}</button>
              </li>
            );
          })}
        </ul>
      </Show>
    </>
  );
}

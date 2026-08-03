import { createEffect, createSignal, onCleanup, Show } from 'solid-js';

import {
  MediaQueryListenerFactory,
  MediaQueryPattern,
} from '../../utils/media-query/index.js';
import { BaseBookProps, Book } from '../Book/index.jsx';
import { MediaQuerySizerConfig } from '../../utils/media-query/index.js';

export interface FlexibleBookPropsWithSingleConfig {
  config: BaseBookProps;
}

export interface FlexibleBookMediaQuery {
  config: BaseBookProps;
  pattern: MediaQueryPattern;
}

export interface FlexibleBookPropsWithMediaQueryList {
  mediaQueryList: [BaseBookProps, ...Array<FlexibleBookMediaQuery>];
}

export type FlexibleBookProps = (
  FlexibleBookPropsWithSingleConfig | FlexibleBookPropsWithMediaQueryList
) & {
  text: string;
};

export function FlexibleBook(props: FlexibleBookProps) {
  const { text } = props;
  let fallback: BaseBookProps;
  let mediaQueryList: Array<FlexibleBookMediaQuery & { matches: boolean }> = [];

  let flexibleBookElement: HTMLDivElement;

  if ('mediaQueryList' in props) {
    fallback = props.mediaQueryList[0];
    const [, ...configs] = [...props.mediaQueryList];
    mediaQueryList = configs
      .sort(
        (queryA, queryB) => queryB.pattern.minWidth - queryA.pattern.minWidth,
      )
      .map((mediaQueryConfig) => {
        const matchesMedia = window.matchMedia(
          `(min-width: ${mediaQueryConfig.pattern.minWidth}px)`,
        );

        return {
          ...mediaQueryConfig,
          get matches() {
            return matchesMedia.matches;
          },
        };
      });
  } else {
    fallback = props.config;
  }

  const [bookConfig, setBookConfig] = createSignal<BaseBookProps>();

  const size: MediaQuerySizerConfig['size'] = () => {
    const bookConfig =
      mediaQueryList.find((mediaQuery) => mediaQuery.matches)?.config ??
      fallback;

    setBookConfig({ ...bookConfig });
  };

  createEffect(() => {
    const destroySizer = MediaQueryListenerFactory.createSizer(
      {
        size,
      },
      flexibleBookElement!,
    );

    onCleanup(destroySizer);
  });

  return (
    <div ref={flexibleBookElement!}>
      <Show when={bookConfig()} keyed>
        {(config) => {
          return <Book text={text} {...config} />;
        }}
      </Show>
    </div>
  );
}

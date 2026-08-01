import { createEffect, createSignal, onCleanup, Show } from 'solid-js';

import {
  MediaQueryListenerFactory,
  MediaQueryPattern,
} from '../../utils/media-query';
import { BaseBookProps, Book } from '../Book';
import { MediaQuerySizerConfig } from '../../utils/media-query';

interface FlexibleBookPropsWithSingleConfig {
  config: BaseBookProps;
}

interface FlexibleBookMediaQuery {
  config: BaseBookProps;
  pattern: MediaQueryPattern;
}

interface FlexibleBookPropsWithMediaQueryList {
  mediaQueryList: [BaseBookProps, ...Array<FlexibleBookMediaQuery>];
}

type FlexibleBookProps = (
  FlexibleBookPropsWithSingleConfig | FlexibleBookPropsWithMediaQueryList
) & {
  text: string;
};

export function FlexibleBook({ text, ...remainingProps }: FlexibleBookProps) {
  let fallback: BaseBookProps;
  let mediaQueryList: Array<FlexibleBookMediaQuery & { matches: boolean }> = [];

  let flexibleBookElement: HTMLDivElement;

  if ('mediaQueryList' in remainingProps) {
    fallback = remainingProps.mediaQueryList[0];
    const [, ...configs] = [...remainingProps.mediaQueryList];
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
    fallback = remainingProps.config;
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

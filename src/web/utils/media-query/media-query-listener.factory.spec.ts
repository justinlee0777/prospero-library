import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.useFakeTimers();

import { MediaQueryListenerFactory } from './index';

describe('MediaQueryListenerFactory', () => {
  let oldInnerWidth: number;

  let oldMatchMedia: Window['matchMedia'];
  let media: Array<MediaQueryList>;

  beforeEach(() => {
    oldInnerWidth = window.innerWidth;

    oldMatchMedia = window.matchMedia;
    media = [];

    window.matchMedia = vi.fn().mockImplementation(() => {
      const queryList = {
        matches: false,
      };

      media.push(queryList as any);

      return queryList;
    }) as any;
  });

  afterEach(() => {
    window.innerWidth = oldInnerWidth;
    window.matchMedia = oldMatchMedia;
  });

  it('creates a listener for several viewport widths', () => {
    const values = Array(3);

    const foo = vi
      .fn()
      .mockImplementation(
        (state: boolean) => (values[0] = state ? 'show' : 'hide'),
      );
    const bar = vi
      .fn()
      .mockImplementation(
        (state: boolean) => (values[1] = state ? 'show' : 'hide'),
      );
    const baz = vi
      .fn()
      .mockImplementation(
        (state: boolean) => (values[2] = state ? 'show' : 'hide'),
      );

    const destroy = MediaQueryListenerFactory.create(
      {
        show: () => foo(true),
        hide: () => foo(false),
      },
      {
        minWidth: 500,
        show: () => baz(true),
        hide: () => baz(false),
      },
      {
        minWidth: 800,
        show: () => bar(true),
        hide: () => bar(false),
      },
    );

    expect(media.length).toBe(2);
    const [barMedia, bazMedia] = media;

    expect(foo).toHaveBeenCalledTimes(1);
    expect(values).toEqual(['show', 'hide', 'hide']);

    (bazMedia as any).matches = true;
    window.dispatchEvent(new Event('resize'));

    vi.advanceTimersByTime(300);

    expect(values).toEqual(['hide', 'hide', 'show']);
    expect(baz).toHaveBeenCalledTimes(2);

    // No redundant calls

    vi.advanceTimersByTime(300);
    window.dispatchEvent(new Event('resize'));

    expect(values).toEqual(['hide', 'hide', 'show']);
    expect(baz).toHaveBeenCalledTimes(2);

    (bazMedia as any).matches = false;
    (barMedia as any).matches = true;

    vi.advanceTimersByTime(300);
    window.dispatchEvent(new Event('resize'));

    expect(values).toEqual(['hide', 'show', 'hide']);
    expect(bar).toHaveBeenCalledTimes(3);

    destroy();
  });

  it('creates a listener for an element resizing', () => {
    const mockObserve = vi.fn();
    const mockUnobserve = vi.fn();
    const mockDisconnect = vi.fn();

    let trigger: any;

    window.ResizeObserver = class MockResizeObserver {
      constructor(public size: any) {
        trigger = () => size();
      }

      observe = mockObserve;
      unobserve = mockUnobserve;
      disconnect = mockDisconnect;
    };

    const element = document.createElement('div');
    document.body.appendChild(element);

    const mockSize = vi.fn();

    const destroy = MediaQueryListenerFactory.createSizer(
      {
        size: mockSize,
      },
      element,
    );

    expect(mockObserve).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(element, { box: 'border-box' });

    trigger();

    vi.advanceTimersByTime(300);

    expect(mockSize).toHaveBeenCalledTimes(1);
    // Sadly JSDOM does not do any calculation, so we'll have to be happy with this.
    expect(mockSize).toHaveBeenCalledWith(0, 0);

    trigger();

    vi.advanceTimersByTime(300);

    expect(mockSize).toHaveBeenCalledTimes(2);

    document.body.removeChild(element);
    destroy();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});

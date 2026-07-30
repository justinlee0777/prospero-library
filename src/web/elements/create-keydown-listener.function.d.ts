interface KeyCodesFunctionMap {
  [code: KeyboardEvent['code']]: EventListenerOrEventListenerObject;
}
export default function createKeydownListener(
  map: KeyCodesFunctionMap,
): EventListenerOrEventListenerObject;
export {};
//# sourceMappingURL=create-keydown-listener.function.d.ts.map

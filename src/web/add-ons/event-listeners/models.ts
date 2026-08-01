export interface BookEventListener<EventType extends Event> {
  (args: {
    event: EventType;
    increment: () => void;
    decrement: () => void;
    bookElement: HTMLDivElement;
  }): void;
}

import SwipeDirection from './swipe-direction.enum';
interface SwipeListener {
    /**
     * @params swipeDirections indicating the direction the user swiped in. It is ordered by intensity, most to least.
     */
    (swipeDirections: Array<SwipeDirection>): void;
}
/**
 * @params sensitivity to determine how much movement on the screen the swipe needs to show before calling.
 * @returns a callback that destroys the listeners.
 */
export default function registerSwipeListener(element: HTMLElement, listener: SwipeListener, sensitivity?: number): () => void;
export {};
//# sourceMappingURL=register-swipe-listener.function.d.ts.map
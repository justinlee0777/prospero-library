/**
 * TODO: Remember to destroy event listeners.
 */
export default function setEventListeners(element, eventListeners) {
    Object.entries(eventListeners).forEach(([eventName, callback]) => {
        element.addEventListener(eventName, callback);
    });
}

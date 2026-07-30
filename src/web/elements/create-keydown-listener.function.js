export default function createKeydownListener(map) {
  return (event) => {
    const keyCode = event.code;
    Object.entries(map).forEach(([matchingCode, callback]) => {
      if (keyCode === matchingCode) {
        typeof callback === 'object'
          ? callback.handleEvent(event)
          : callback(event);
      }
    });
  };
}

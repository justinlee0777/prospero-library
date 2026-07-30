import setElement from './set-element.function';
const div = (...args) => {
  const element = document.createElement('div');
  setElement(element, ...args);
  return element;
};
export default div;

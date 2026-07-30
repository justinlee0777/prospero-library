import setElement from './set-element.function';
const li = (...args) => {
  const element = document.createElement('li');
  setElement(element, ...args);
  return element;
};
export default li;

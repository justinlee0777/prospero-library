import setElement from './set-element.function';
const ul = (...args) => {
  const element = document.createElement('ul');
  setElement(element, ...args);
  return element;
};
export default ul;

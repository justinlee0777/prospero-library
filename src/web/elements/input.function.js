import setElement from './set-element.function';
const input = (type, { minlength, maxlength } = {}, ...args) => {
  const element = document.createElement('input');
  element.type = type;
  minlength && (element.minLength = minlength);
  maxlength && (element.maxLength = maxlength);
  setElement(element, ...args);
  return element;
};
export default input;

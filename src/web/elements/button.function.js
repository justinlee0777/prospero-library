import setElement from './set-element.function';
const button = (...args) => {
    const element = document.createElement('button');
    setElement(element, ...args);
    return element;
};
export default button;

import {
  PageProps,
  ProsperoPageElement,
  ProsperoSlateElement,
  registerPageComponent,
  registerSlateComponent,
} from '../../src/web/components.jsx';
import { Pages } from '../../src/web/utils.js';

const fileUrl = new URL('../text-samples/tempest.txt', import.meta.url);

const response = await fetch(fileUrl);
const text = await response.text();

registerPageComponent();
registerSlateComponent();

const pageStyles: PageProps['styles'] = {
  background: 'gray',
  'font-family': 'Arial',
  'font-size': '16px',
  height: '8in',
  width: '5in',
  'line-height': '2',
  padding: '2em 1em',
};

const mainElement = document.querySelector('main')!;

const slate = document.createElement('prospero-slate') as ProsperoSlateElement;

slate.styles = pageStyles;

mainElement.appendChild(slate);

const pages = new Pages(slate.children.item(0) as HTMLElement, text);

let i = 0;

let page = await pages.get(i);

while (page) {
  const pageElement = document.createElement(
    'prospero-page',
  ) as ProsperoPageElement;

  pageElement.styles = pageStyles;
  pageElement.page = {
    number: i,
    content: page,
  };

  mainElement.appendChild(pageElement);

  page = await pages.get(++i);
}

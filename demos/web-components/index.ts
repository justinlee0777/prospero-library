import '../../src/web/styles/themes/BookTheme.css';

import {
  ProsperoBookElement,
  registerBookComponent,
  turnPageOnClick,
} from '@prospero/web';

registerBookComponent();

const prosperoBook = document.createElement(
  'prospero-book',
) as ProsperoBookElement;

prosperoBook.pages = ['foo', 'bar', 'baz'];
prosperoBook.containerStyles = {
  width: '375px',
  height: '667px',
};

prosperoBook.pageStyles = {
  'font-family': 'Bookerly',
  'font-size': '12px',
  'line-height': '24px',
  padding: '24px',
};

prosperoBook.pagesShown = 1;

prosperoBook.events = {
  onClick: turnPageOnClick,
};

document.querySelector('main')!.appendChild(prosperoBook);

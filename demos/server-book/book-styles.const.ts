import { BookStyles } from '@prospero/web';

export const mobileStyles: BookStyles = {
  containerStyles: {
    width: '375px',
    height: '667px',
  },
  pageStyles: {
    'font-family': 'Bookerly',
    'font-size': '12px',
    'line-height': '24px',
    padding: '24px',
  },
};

export const desktopStyles: BookStyles = {
  containerStyles: {
    width: '750px',
    height: '667px',
  },
  pageStyles: {
    'font-family': 'Bookerly',
    'font-size': '16px',
    'line-height': '24px',
    padding: '24px',
  },
};

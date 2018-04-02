import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { IntlProvider } from 'react-intl'

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<IntlProvider locale="en"><App /></IntlProvider>, div);
});

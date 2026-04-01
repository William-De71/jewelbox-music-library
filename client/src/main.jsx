import { render } from 'preact';
import { App } from './App.jsx';
import { I18nProvider } from './config/i18n/index.jsx';
import './styles/index.css';

render(
  <I18nProvider>
    <App />
  </I18nProvider>,
  document.getElementById('app')
);

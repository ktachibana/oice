import './vendors';
import renderComponent from './components';
import {openMic} from './functions'
import Application from './application';

openMic().then((input) => {
  const app = global.app = new Application(input);
  renderComponent(app, 'app');
});

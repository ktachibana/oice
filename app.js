import './vendors';
import renderComponent from './components';
import {openMic} from './functions'

openMic().then((input) => {
  renderComponent(input, 'app');
});

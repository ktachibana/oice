import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

module.exports = function(app, nodeId) {
    ReactDOM.render(<App app={app} />, document.getElementById(nodeId));
};

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Main from './views/main';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Main />
      </Provider>
    );
  }
}

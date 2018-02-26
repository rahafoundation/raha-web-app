import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { auth } from './firebaseInit';
import { authSetFirebaseUser } from './actions';
import AppRouter from './components/AppRouter';
import store from './store';

class App extends Component {
  componentDidMount() {
    auth.onAuthStateChanged(authFirebaseUser => {
      store.dispatch(authSetFirebaseUser(authFirebaseUser));
    });
  }

  render() {
    return (
      <Provider store={store}>
        <AppRouter />
      </Provider>
    );
  }
}

export default App;

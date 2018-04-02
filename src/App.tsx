import * as React from "react";
import { Provider } from "react-redux";
import { authSetFirebaseUser } from "./actions";
import AppRouter from "./components/AppRouter";
import { auth } from "./firebaseInit";
import store from "./store";

class App extends React.Component {
  public componentDidMount() {
    auth.onAuthStateChanged(authFirebaseUser => {
      store.dispatch<any>(authSetFirebaseUser(authFirebaseUser));
    });
  }

  public render() {
    return (
      <Provider store={store}>
        <AppRouter />
      </Provider>
    );
  }
}

export default App;

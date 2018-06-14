import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import { routerMiddleware as createRouterMiddleware } from "react-router-redux";

import { rootReducer } from "./reducers";
import { routerHistory } from "./AppRouter";

const routerMiddleware = createRouterMiddleware(routerHistory);

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk, routerMiddleware))
);

export { AppState } from "./reducers";
export { store };

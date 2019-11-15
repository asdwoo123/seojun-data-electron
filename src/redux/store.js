const { createStore, combineReducers, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;
const reducers = require('./reducers');

const store = createStore(
    combineReducers({
        ...reducers
    }),
    applyMiddleware(
        thunk
    )
);


module.exports = store;

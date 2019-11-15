import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

import App from './App';

reactDom.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);

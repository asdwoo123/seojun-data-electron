import React from 'react'
import { Router } from './components'
import routes from './pages/routes'
import './styles/index.less'
import opcua from './service/opcua';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    opcua();
  }

  render() {
    return (
      <div id="app">
        <Router routes={routes} />
      </div>
    )
  }

} // class App end

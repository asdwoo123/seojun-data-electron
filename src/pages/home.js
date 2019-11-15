import React from 'react';
import { Radio } from 'antd';
import { Route } from 'react-router-dom';
import Monitor from './monitor/monitor';
import History from "./history/history";
import Setting from "./setting/setting";
import { getSettings } from '../service/database';

const { remote } = require('electron');
const { dialog } = remote;

export default class Home extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        mode: 'monitor'
    };

    componentDidMount() {
        const { pathname } = this.props.location;
        const mode = (pathname === '/') ? 'monitor' : pathname.substr(1);
        this.setState({ mode });

        const obj = getSettings();
        const result = ['projectName', 'databaseName', 'stations'].every(prop => obj.hasOwnProperty(prop));
        /*if (!result) {
            const options = {
                title: 'error',
                message: 'The configuration file does not exist.',
                buttons: ['Ok']
            };
            dialog.showMessageBox(null, options);
            this.props.history.push('setting');
            this.setState({ mode: 'setting' });
        }*/
    }

    handleModeChange = (e) => {
        const mode = e.target.value;
        this.props.history.push(mode);
        this.setState({ mode });
    };

    render() {
        const { mode } = this.state;
        return (
            <div className="flex column">
                <div className="flex row between">
                    <div>
                        <img width={120} src={require('../../assets/logo/seojuneng-logo.png')} alt="logo"/>
                    </div>
                    <Radio.Group buttonStyle="solid" value={mode}
                                 onChange={this.handleModeChange}
                                 style={{ marginBottom: 50, marginTop: 10 }}>
                        <Radio.Button value="monitor">Monitor</Radio.Button>
                        <Radio.Button value="history">History</Radio.Button>
                        <Radio.Button value="setting">Setting</Radio.Button>
                    </Radio.Group>
                </div>
                <Route exact path="/" component={() => <Monitor />} />
                <Route exact path="/monitor" component={() => <Monitor />} />
                <Route exact path="/history" component={() => <History />} />
                <Route exact path="/setting" component={() => <Setting />} />
            </div>
        )
    }

} // class Home end

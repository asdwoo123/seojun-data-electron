import React from 'react'
import {connect} from 'react-redux';
import {Card, Row, Col} from 'antd';
const { remote } = require('electron');

const { app } = remote;

class Monitor extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {realTime} = this.props;
        return (
            <div>
                <Row gutter={16}>
                    {
                        (realTime.realTime.length > 0) ?
                            realTime.realTime.map((station, index) => (
                                <Col key={index} xs={24} md={12} lg={8} style={{marginBottom: 16}}>
                                    <Card className="ccc" title={station.stationName} headStyle={{
                                        backgroundColor: (realTime.opcState[index].state) ? 'green': 'red',
                                        color: '#001737'
                                    }}>
                                        <p style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between"
                                        }}>
                                            <span style={{color: '#001737'}}>barcode</span>
                                            <span>{station.productId}</span>
                                        </p>
                                        <div id={station.stationName} />
                                        {
                                            station.data.map((data, index1) => (
                                                <p key={index1}
                                                   style={{
                                                       display: "flex",
                                                       flexDirection: "row",
                                                       justifyContent: "space-between"
                                                   }}>
                                                    <span style={{color: '#001737'}}>{data.dataName}</span>
                                                    <span>{data.dataValue}</span>
                                                </p>
                                            ))
                                        }
                                    </Card>
                                </Col>
                            )) : null
                    }
                </Row>
            </div>
        )
    }

} // class Monitor end

export default connect(
    (state) => ({
        realTime: state.realTime
    })
)(Monitor);

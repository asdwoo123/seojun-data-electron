import React from 'react'
import {Button, Table, Input, notification, DatePicker, Menu, Dropdown, Icon, Modal, Select} from 'antd'
import {upperFirst, uniqBy} from 'lodash';
import {alertSubject} from '../../redux/save/async';
import {getDB, getDBList} from '../../service/database';
import {getSettings} from '../../service/utils';

const fs = require('fs');
const {dialog} = require('electron').remote;
const stringify = require('csv-stringify');
const {RangePicker} = DatePicker;
const {Column, ColumnGroup} = Table;
const moment = require('moment');
const {Option} = Select;


export default class History extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        columns: null,
        dataSource: [],
        originalData: [],
        search: '',
        period: [],
        visible: false,
        modalData: null,
        completes: [],
        dbList: null,
        dateString: []
    };

    handleInput = (e) => {
        const value = e.target.value;
        this.setState({search: value});

        const dataSource = this.state.originalData.filter(d => {
            if (d.hasOwnProperty('productId')) {
                return d.productId.indexOf(value) !== -1
            }
        })
            .filter(v => {
                const {dateString} = this.state;
                if (dateString.length < 1) return true;
                if (v.hasOwnProperty('createdAt')) {
                    return moment(v.createdAt).isBetween(dateString[0], dateString[1], null, '[]');
                }
            });
        this.setState({dataSource});
    };

    handleDaySearch = (date, dateString) => {
        this.setState({
            period: date,
            dateString
        });
        const searchData = this.state.search;
        const dataSource = this.state.originalData
            .filter(v => {
                if (v.hasOwnProperty('productId')) {
                    return v.productId.indexOf(searchData) !== -1
                }
            })
            .filter(v => {
                if (date.length < 1) return true;
                if (v.hasOwnProperty('createdAt')) {
                    return moment(v.createdAt).isBetween(dateString[0], dateString[1], null, '[]');
                }
            });
        this.setState({dataSource});
    };

    loadData = () => {
        const db = getDB();
        let completes = db.get('completes').value();
        if (completes.length > 0) {
            completes = completes.reverse();
            this.setState({completes});
            const originalData = completes.map((complete) => {
                const key = complete.id;
                const productId = complete.productId;
                const createdAt = moment(complete.createdAt).format('YYYY-MM-DD');
                const createDetail = moment(complete.createdAt).format('YYYY-MM-DD h:mm:ss a');
                const com = complete.stations.map((station, index) => station.data.reduce((acc, one) => (
                    {...acc, [one.dataName + '-' + (index + 1)]: one.dataValue}
                ), {}));
                const data = com.reduce((acc, one) => ({...acc, ...one}), {});
                return {
                    key,
                    productId,
                    createdAt,
                    createDetail,
                    ...data
                }
            });
            this.setState({originalData});
            this.setState({dataSource: originalData});
        }
    };

    componentDidMount() {
        const dbListFile = getDBList();
        if (dbListFile) {
            const dbList = dbListFile.map(db => db.substring(0, db.length - 5));
            this.setState({dbList});
        }
        const settings = getSettings();

        const columns = settings.stations.map((station) =>
            ({stationName: station.name, data: station.data.map(v => v.dataName)}));

        this.setState({columns});

        this.loadData();

        this.subscription = alertSubject.subscribe(this.loadData);
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    saveOnData = (e) => {
        const {dataSource, originalData} = this.state;
        const k = e.key;
        const data = (k > 1) ? originalData : dataSource;
        const options = {
            defaultPath: '/data.csv',
        };

        dialog.showSaveDialog(null, options, (path) => {
            let columns = {};
            const keys = Object.keys(data[0]);
            keys.pop();
            keys.forEach(k => {
                columns = {
                    ...columns,
                    [k]: k
                };
            });
            const values = data.map(v => Object.values(v));
            stringify(values, {header: true, columns}, (err, output) => {
                if (!err) {
                    fs.writeFile(path, output, function (err) {
                        if (err) {
                            notification.open({message: 'Save failed.', duration: 1.5});
                        } else {
                            notification.open({message: 'Saved successfully.', duration: 1.5});
                        }
                    });
                }
            });
        });
    };

    openModal = (e) => {
        const key = e.key;
        let modalData = this.state.completes.filter(v => v.id === key);
        if (modalData.length > 0) {
            modalData = modalData[0];
            modalData.stations = uniqBy(modalData.stations, obj => obj.stationName);
            this.setState({
                modalData,
                visible: true
            });
        }
    };

    closeModal = () => {
        this.setState({
            visible: false
        });
    };

    handleDBChange = (value) => {
        console.log(value);
    };

    render() {
        const {dataSource, columns, search, period, modalData, dbList} = this.state;
        const menu = (
            <Menu onClick={this.saveOnData}>
                <Menu.Item key="1">search data</Menu.Item>
                <Menu.Item key="2">all data</Menu.Item>
            </Menu>
        );

        return (
            <div className="flex column">
                <div style={{marginBottom: 25}}>
                    {
                        (dbList) ?
                            <Select defaultValue={dbList[0]} style={{width: 120, marginRight: 10}}
                                    onChange={this.handleDBChange}>
                                {
                                    dbList.map((db, index) => (
                                        <Option key={index} value={db}>{db}</Option>
                                    ))
                                }
                            </Select> : null
                    }
                    <Input style={{width: '20%', marginBottom: 15, marginRight: 10}}
                           placeholder="barcode search" value={search} onChange={this.handleInput}/>
                    <RangePicker value={period} style={{marginRight: 10}} onChange={this.handleDaySearch}/>
                    <Dropdown overlay={menu}>
                        <Button type="primary" style={{width: 140, marginRight: 10}}>export to csv<Icon
                            type="down"/></Button>
                    </Dropdown>
                    <Button type="primary" onClick={() => {
                        this.setState({
                            search: '',
                            period: []
                        });
                        this.loadData()
                    }}>sync<Icon type="sync"/></Button>
                </div>
                {
                    (columns) ?
                        <Table bordered dataSource={dataSource}
                               onRow={(record) => ({onClick: () => this.openModal(record)})}>
                            <Column title="Barcode" dataIndex="productId" key="productId"/>
                            <Column title="CreatedAt" dataIndex="createDetail" key="createDetail"/>
                            {

                                columns.map((station, index) => (
                                    <ColumnGroup key={index} title={upperFirst(station.stationName)}>
                                        {
                                            station.data.map(
                                                (v) => (
                                                    <Column title={upperFirst(v)}
                                                            dataIndex={v + '-' + (index + 1)}
                                                            key={v + '-' + index + 1}/>
                                                ))
                                        }
                                    </ColumnGroup>
                                ))
                            }
                        </Table> : null
                }
                <Modal
                    visible={this.state.visible}
                    onCancel={this.closeModal}
                    footer={[]}
                >
                    {
                        (modalData) ?
                            <>
                                <p className="flex between">
                                    <span>Barcode</span>
                                    <span>{modalData.productId}</span>
                                    <span style={{width: 16}}/>
                                </p>
                                {
                                    modalData.stations.map((station, index) => (
                                        <div style={{marginTop: 20}} key={index}>
                                            <p>{station.stationName}</p>
                                            {
                                                (station.data) ?
                                                    station.data.map((v, i) => (
                                                        <p key={i} className="flex between">
                                                            <span>{v.dataName}</span>
                                                            <span>{v.dataValue}</span>
                                                        </p>
                                                    )) : null
                                            }
                                        </div>
                                    ))
                                }
                            </>
                            : null
                    }
                </Modal>
            </div>
        )
    }

} // class Page end

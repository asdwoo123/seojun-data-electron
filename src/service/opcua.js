const { OPCUAClient, ClientSubscription, ClientMonitoredItem, AttributeIds } = require('node-opcua');
const { getSettings } = require('./utils');
const store = require('../redux/store');
const { insertRealTimeAsync, opcStateChangeAsync } = require('../redux/realTime/async');
const { insertSaveAsync, completeSaveAsync } = require('../redux/save/async');
const path = require('path');
const moment = require('moment');
const { remote } = require('electron');

const { app } = remote;

module.exports = () => {
    const settings = getSettings();
    if (!settings) return;

    const stations = settings.stations;


    stations.forEach(async (station, index) => {
        const stationName = station.name;
        store.dispatch(insertRealTimeAsync({
            productId: '',
            stationName,
            data: station.data.map(
                (v) => ({
                    dataName: v.dataName,
                    dataValue: ''
                })
            )
        }));

        store.dispatch(opcStateChangeAsync({
            stationName,
            state: false
        }));

        const url = 'opc.tcp://' + station.uri;
        const options = {
            certificateFile : path.join(app.getAppPath(), 'assets/client_selfsigned_cert_2048.pem'),
            privateKeyFile: path.join(app.getAppPath(), 'assets/private_key.pem')
        };

        const client = OPCUAClient.create(options);
        await client.connect(url);

        client.on('connected', () => {
            store.dispatch(opcStateChangeAsync({
                stationName,
                state: true
            }));
            console.log('connected: ', moment().format('h:mm:ss a'));
        });

        client.on('connection_failed', () => {
            store.dispatch(opcStateChangeAsync({
                stationName,
                state: false
            }));
            console.log('connection_failed: ', moment().format('h:mm:ss a'));
        });

        client.on('backoff', () => {
           console.log('backoff: ', moment().format('h:mm:ss a'));
        });

        client.on('close', () => {
            console.log('close: ', moment().format('h:mm:ss a'));
        });



        const session = await client.createSession(null);
        const subscription = await ClientSubscription.create(session, {
            requestedPublishingInterval: 500,
            publishingEnabled: true,
            priority: 10
        });

        subscription.on("started", function() {
            console.log("subscription started for 2 seconds - subscriptionId=", subscription.subscriptionId);
        }).on("keepalive", function() {
            console.log("keepalive");
        }).on("terminated", function() {
            console.log("terminated");
        });

        const itemToMonitor = {
            nodeId: `${station.complete}`,
            attributeId: AttributeIds.Value
        };

        const parameters = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 100
        };

        const monitoredItem = ClientMonitoredItem.create(
            subscription,
            itemToMonitor,
            parameters
        );

        monitoredItem.on('changed', async (dataValue) => {
            const data = dataValue.value.value;
            if (data) {
                const productPro = Promise.all(
                    station.productId.map(async (barcode) => {
                        const v = await session.readVariableValue(barcode);
                        return v.value.value;
                    }));
                const productArr = await productPro;
                const productId = productArr.join('');
                if (productId) {
                    const stationData = await Promise.all(
                        station.data.map(async (node) => {
                            const {nodeId, dataName} = node;

                            const nodeValue = await session.readVariableValue(nodeId);
                            const dataValue = nodeValue.value.value;

                            return {dataName, dataValue};
                        }));

                    store.dispatch(insertRealTimeAsync({
                        productId,
                        stationName,
                        data: stationData
                    }));

                    store.dispatch(insertSaveAsync({
                        productId,
                        stationName,
                        data: stationData
                    }));

                    if (index === settings.stations.length - 1) {
                        store.dispatch(completeSaveAsync(
                            productId
                        ));
                    }
                } else {
                    console.error("nodeId in productId is invalid");
                }
            }
        });
    });
};

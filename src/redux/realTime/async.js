const store = require('../store');
const actions = require('./actions');

exports.insertRealTimeAsync = (station) => (
    (dispatch) => {
        const realData = store.getState().realTime.realTime;
        if (!station) {
            dispatch(actions.insertRealTime(realData));
        }
        if (realData instanceof Array) {
            const result = realData.find(v => {
                if (v instanceof Object) {
                    if (v.hasOwnProperty('stationName')) {
                        return v.stationName === station.stationName;
                    }
                }
            });
            if (result) {
                const i = realData.indexOf(result);
                realData[i] = station;
                dispatch(actions.insertRealTime(realData));
            } else {
                dispatch(actions.insertRealTime([
                    ...realData,
                    station
                ]));
            }
        } else {
            dispatch(actions.insertRealTime(realData));
        }
    }
);

exports.opcStateChangeAsync = (station) => (
    (dispatch) => {
        const opcState = store.getState().realTime.opcState;

        if (opcState.length > 0) {
            const result = opcState.find((opc) => opc.stationName === station.stationName);
            if (result) {
                const index = opcState.indexOf(result);
                opcState[index] = station;
                dispatch(actions.opcStateChange(opcState));
            } else {
                dispatch(actions.opcStateChange([
                    ...opcState,
                    station
                ]));
            }
        } else {
            dispatch(actions.opcStateChange([
                station
            ]));
        }
    }
);

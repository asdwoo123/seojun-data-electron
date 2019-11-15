const {from, Subject} = require('rxjs');
const {groupBy, mergeMap, reduce, map, filter, last} = require('rxjs/operators');
const store = require('../store');
const actions = require('./actions');
const { getDB } = require('../../service/database');
const { uniqBy } = require('lodash');

const db = getDB();

const alertSubject = new Subject();

exports.alertSubject = alertSubject;


exports.insertSaveAsync = (station) => (
    (dispatch) => {
        let arr = store.getState().save;
        arr = [...arr, station];
        if (arr.length > 99) {
            arr.shift();
        }

        dispatch(actions.insertSave(arr));
    }
);

exports.completeSaveAsync = (productId) => (
    () => {
        let arr = store.getState().save;

        from(arr).pipe(
            groupBy((v) => v.productId),
            mergeMap((group$) => group$.pipe(
                reduce((acc, cur) => [...acc, cur], [])
            )),
            map((v) => {
                if (v.length > 0) {
                    const productId = v[0].productId;

                    let stations = v.map((station) => {
                        const {stationName, data} = station;
                        return {
                            stationName,
                            data
                        }
                    });

                    stations = uniqBy(stations, (obj) => obj.stationName);

                    return {
                        productId,
                        stations
                    }
                }
            }),
            filter(v => v.productId === productId),
            last()
        ).subscribe((v) => {
            const size = db.get('completes').size().value();
            const id = (size + 1).toString();

            const createdAt = new Date().getTime();

            db.get('completes')
                .push({id, createdAt, ...v})
                .write();

            alertSubject.next(1);
        });
    }
);

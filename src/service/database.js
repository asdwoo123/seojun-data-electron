const low = require('lowdb');
const LocalStorage = require('lowdb/adapters/LocalStorage');

const adapter = new LocalStorage('db');
const db = low(adapter);

db.defaults({ completes: [], settings: {} }).write();

exports.getDBList = () => {
    try {
        return ['db.json'];
    } catch (e) {
        return null;
    }
};

exports.getDB = () => db;

exports.getSettings = () => db.get('settings').value();

import { message } from 'antd';
const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const path = require('path');
const Crypto = require('crypto');

const { app } = remote;

export const getSettings = () => {
    try {
        const appPath = app.getAppPath();
        let settings = fs.readFileSync(path.join(appPath, 'assets/Settings.sj'));
        const decipher = Crypto.createDecipher('aes-256-cbc', 'seojun');
        const decrypted = Buffer.concat([decipher.update(new Buffer(settings, "utf8")), decipher.final()]);
        settings = JSON.parse(decrypted.toString());
        return settings;
    } catch (e) {
        console.error(e);
    }
};

export async function getIpcOnceRequest(endpoint, data) {
    getAsyncRequest(endpoint, data);
    return checkResponse(await getAsyncOnceData(endpoint + '-reply'))
}

export function getSyncRequest(endpoint, data) {
    return checkResponse(ipcRenderer.sendSync(endpoint, data))
}

export function getAsyncRequest(endpoint, data) {
    ipcRenderer.send(endpoint, data)
}

export async function getAsyncOnceData(endpoint) {
    return new Promise((resolve, reject) => {
        ipcRenderer.once(endpoint, (event, arg) => {
            resolve(arg)
        })
    })
}
export function checkResponse(response) {
    console.log(response)
    if (response.code != '20000') {
        message.error('service error, please restart~')
    }
    return response
}

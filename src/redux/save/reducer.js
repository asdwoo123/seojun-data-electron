const {SAVE_INSERT} = require('./actions');

const initState = [];

module.exports = (state = initState, {type, payload}) => {
    switch (type) {
        case SAVE_INSERT:
            return payload;
        default:
            return state;
    }
};

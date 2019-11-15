const {REAL_TIME_INSERT, REAL_TIME_STATE} = require('./actions');

const initState = {realTime: [], opcState: []};

module.exports = (state = initState, {type, payload}) => {
    switch (type) {
        case REAL_TIME_INSERT:
            return {
                ...state,
                realTime: payload
            };
        case REAL_TIME_STATE:
            return {
                ...state,
                opcState: payload
            };
        default:
            return state;
    }
};

const actions = {
    REAL_TIME_INSERT: "REAL_TIME_INSERT",
    REAL_TIME_STATE: "REAL_TIME_STATE",
    insertRealTime: (data) => ({
        type: actions.REAL_TIME_INSERT,
        payload: data
    }),
    opcStateChange: (data) => ({
        type: actions.REAL_TIME_STATE,
        payload: data
    })
};

module.exports = actions;

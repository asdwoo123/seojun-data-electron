const actions = {
    SAVE_INSERT: "SAVE_INSERT",
    SAVE_COMPLETE: "SAVE_COMPLETE",
    insertSave: (data) => ({
        type: actions.SAVE_INSERT,
        payload: data
    })
};

module.exports = actions;

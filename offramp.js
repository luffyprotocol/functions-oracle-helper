const messageExecutionState = require("../constants/messageState.json");

const getMessageStatus = (status) => {
  if (status in messageExecutionState) {
    return messageExecutionState[status];
  }
  return "unknown";
};

module.exports = {
  getMessageStatus,
};

function createLogEntry(requestLogID) {
    console.log("LOG: added " + requestLogID);
}

function updateLogEntry(requestLogID, start_latitude, end_latitude, start_longitude, end_longitude) {
    console.log("LOG: updated " + requestLogID);
    console.log("LOG: S_LAT E_LAT S_LON E_LON " + start_latitude + ", " + end_latitude + ", " + start_longitude + ", " + end_longitude);
}

function endLogEntryWithSuccess(requestLogID) {
    console.log("LOG: ended (success) " + requestLogID);
}

function endLogEntryWithFailureReason(requestLogID, reason) {
    console.log("LOG: ended (failure) " + requestLogID);
    console.log("LOG: reason " + reason);
}

// Make these functions accessible (public) from `index.js`.
module.exports.createLogEntry = createLogEntry;
module.exports.updateLogEntry = updateLogEntry;
module.exports.endLogEntryWithFailureReason = endLogEntryWithFailureReason;

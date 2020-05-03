const connect = require("../database/database");
const amqp = require("amqplib/callback_api");

module.exports = async (req, res) => {

  if (!req.body.errorCode) return res.status(400).json({ success: false, message: "Please provide error code" });

  let trackingId = req.query.trackingId;
  let errorCode = req.body.errorCode;
  let cronjob = req.body.cronjob;

  let errorDes = (errorCode == "666") ? "Failure" : "Success";
  let retryAllowed = 3;
  let cronRetryAllowed = 3;
  let retryCount = 0;
  let cronRetryCount = 0;
  let status = (errorCode == "666") ? "P" : "C";
  

  if (trackingId) {

    let query0 = `SELECT * FROM Tbl_bill_pay WHERE trackingId=${trackingId}`;

    connect.query(query0, (error, result, fields) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.sqlMessage });
      } else {
        if (!result.length) return res.status(404).json({ success: false, message: "No transaction found" });
        if (!result[0].errorCode) return res.status(200).json({ success: true, message: "Transaction already completed" });

        let retryCount = result[0].retryCount + 1;
        let cronRetryCount = result[0].cronRetryCount + 1;

        if (cronjob && cronRetryCount > cronRetryAllowed) return res.status(401).json({ success: false, message: "Cronjob Retry limit exceed" });

        if (!cronjob && retryCount > retryAllowed) return res.status(401).json({ success: false, message: "Retry limit exceed" });


        if (cronjob) {
          add_retry_log(trackingId, ((errorCode == "666") ? false : true), cronRetryCount);
          retry_queue(trackingId, errorCode, errorDes, cronRetryAllowed, cronRetryCount, status);

          let query = `UPDATE Tbl_bill_pay SET errorCode = ${errorCode}, errorDes = '${errorDes}', cronRetryAllowed = ${cronRetryAllowed}, cronRetryCount = ${cronRetryCount}, status = '${status}' WHERE trackingId=${trackingId}`;
          connect.query(query, response(res, trackingId, errorCode));
        } else {
          add_retry_log(trackingId, ((errorCode == "666") ? false : true), retryCount);
          retry_queue(trackingId, errorCode, errorDes, retryAllowed, retryCount, status);

          let query = `UPDATE Tbl_bill_pay SET errorCode = ${errorCode}, errorDes = '${errorDes}', retryAllowed = ${retryAllowed}, retryCount = ${retryCount}, status = '${status}' WHERE trackingId=${trackingId}`;
          connect.query(query, response(res, trackingId, errorCode));
        }
      }
    });
  } else {
    let query = `INSERT INTO Tbl_bill_pay (errorCode, errorDes, retryAllowed, retryCount, cronRetryAllowed, cronRetryCount, status) VALUES (${errorCode}, '${errorDes}', ${retryAllowed}, ${retryCount}, ${cronRetryAllowed}, ${cronRetryCount}, '${status}')`;
    connect.query(query, response(res, 0, errorCode));
  }
};

const response = (res, trackingId, errorCode) => {
  return (error, result, fields) => {
    if (error) {
      return res.status(500).json({ success: false, message: error.sqlMessage });
    } else {
      if (errorCode == "666") return res.status(400).json({ success: false, trackingId: ((result.insertId == 0) ? trackingId : result.insertId), message: "Please retry"});
      return res.status(200).json({ success: true, trackingId: ((result.insertId == 0) ? trackingId : result.insertId), message: "Transaction successful" });
    }
  };
};

const retry_queue = (trackingId, errorCode, errorDes, retryAllowed, retryCount, status) => {

  amqp.connect("amqp://localhost", function (error0, connection) {

    if (error0) throw error0;

    connection.createChannel(function (error1, channel) {

      if (error1) throw error1;

      var queue = "Retry_Queue";
      var msg = { trackingId, errorCode, errorDes, retryAllowed, retryCount, status };

      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
      console.log(" [x] Sent %s", JSON.stringify(msg));
    });

    setTimeout(() => connection.close(), 500);
  });
}

const add_retry_log = (trackingId, success, retryTime) => {
  connect.query(`INSERT INTO Tbl_retry_log (trackingId, success, retryTime) VALUES (${trackingId}, '${success}', ${retryTime})`, (error, result, fields) => {
    if (error) {
      console.log("ADD_RETRY_LOG ERROR" + error);
    } else {
      console.log("ADD_RETRY_LOG RESULT" + JSON.stringify(result));
    }
  })
};
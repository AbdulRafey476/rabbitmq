const amqp = require("amqplib/callback_api");
const request = require('request');
const baseurl = process.env.BASE_URL

module.exports = async (req, res) => {

  const errCode = [666, 000];

  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) throw error0;

    connection.createChannel(function (error1, channel) {
      if (error1) throw error1;

      var queue = "Retry_Queue";

      channel.assertQueue(queue, { durable: false });

      console.log(queue);

      channel.consume(queue, function (msg) {
        let trackingId = JSON.parse(msg.content.toString()).trackingId;
        request.post(`${baseurl}api/post_billpay?trackingId=${trackingId}`, { form:{ errorCode:errCode[getRandomInt(2)], cronjob: true }}, (err, httpResponse, body) => { 
          console.log(body);
        });
      }, { noAck: true });
    });
  });

  return res.status(200).json({ success: true, message: "Hit api" });
};


const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};
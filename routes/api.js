const post_billpay = require("../controllers/post_billpay");
const post_process_billpay = require("../controllers/post_process_billpay");

module.exports = (app, express) => {
  const route = express.Router();

  route.post("/api/post_billpay", post_billpay);
  route.post("/api/post_process_billpay", post_process_billpay);

  return route;
};

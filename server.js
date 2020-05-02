require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const routes = require("./routes/api")(app, express);
app.use(routes);

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

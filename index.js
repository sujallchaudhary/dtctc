const express = require('express');
const dotenv = require('dotenv');
const dbConnection = require('./src/database/connection');
dotenv.config();

dbConnection();
const app = express();

const health = require('./src/routes/health.route');

app.use('/health', health);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

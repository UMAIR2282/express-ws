const express = require('express');
const app = express();
const UserRouter = require('./api/1.0/routers/UserRouter');

app.use(express.json());
app.use(UserRouter);

module.exports = app;

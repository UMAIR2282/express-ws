const app = require('./src/app');
const sequelize = require('./src/config/database');
const config = require('config');
const apiServer = config.get('apiServer');

const port = apiServer.port;

sequelize.sync();

app.listen(port, () => console.log('App is Running on Port', port));

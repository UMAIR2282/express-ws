const app = require('./src/app');
const sequelize = require('./src/config/database');
const port = 3000;

sequelize.sync();

app.listen(port, () => console.log('App is Running on Port', port));

const RegisterUser = require('./actions/Register');
const FetchUser = require('./actions/Fetch');
const ActivateUser = require('./actions/Activate');

const findByEmail = async (email) => {
  return await FetchUser.byEmail(email);
};

const register = async (body) => {
  return await RegisterUser.__invoke(body);
};

const activateAccount = async (token) => {
  return await ActivateUser.__invoke(token);
};

module.exports = { activateAccount, findByEmail, register };

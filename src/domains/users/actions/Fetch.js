const User = require('../models/User');

const byEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

const list = async (body) => {
  const limit = body.limit ? body.limit : 10;
  const inactive = body.inactive !== undefined && body.inactive !== null ? body.inactive : 0;
  return await User.findAll({
    attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
    where: { inactive: inactive },
    limit: limit,
  });
};

const listAndCount = async (body) => {
  const page = body.page !== undefined && body.page !== null && parseInt(body.page) > 0 ? parseInt(body.page) : 0;
  const limit = body.limit !== undefined && body.limit !== null && parseInt(body.limit) > 0 ? parseInt(body.limit) : 10;
  const inactive = body.inactive !== undefined && body.inactive !== null && parseInt(body.inactive) > 0 ? parseInt(body.inactive) : 0;
  const userData = await User.findAndCountAll({
    attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
    where: { inactive: inactive },
    limit: limit,
    offset: page * limit,
  });
  return { content: userData.rows, limit: limit, page: page, totalCount: userData.count };
};

const countData = async (body) => {
  const page = body.page !== undefined && body.page !== null ? body.page : 0;
  const limit = body.limit ? body.limit : 10;
  const inactive = body.inactive !== undefined && body.inactive !== null ? body.inactive : 0;
  const count = await User.count({
    where: { inactive: inactive },
  });
  return { limit: limit, page: page, totalCount: count };
};

module.exports = { byEmail, countData, list, listAndCount };

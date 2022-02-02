const express = require('express');
const router = express.Router();
const RegisterUser = require('../../../domains/users/actions/Register');

router.post('/api/1.0/users', async (req, res) => {
  const response = await RegisterUser.__invoke(req);
  return res
    .status(response.status)
    .send({ message: response.message, error: response.error, user: response.user, success: response.success });
});

module.exports = router;

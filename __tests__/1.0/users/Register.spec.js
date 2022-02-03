const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/domains/users/models/User');
const sequelize = require('../../../src/config/database');
const bcrypt = require('bcryptjs');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@test.com',
  password: 'P@ssw0rd',
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(201);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User Created');
  });

  it('saves the user to database', async () => {
    await postUser();
    //query user table
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('saves the username and email to database', async () => {
    await postUser();
    //query user table
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
  });

  it('hashes the password in database', async () => {
    await postUser();
    //query user table
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe(validUser.password);
  });

  it('compare hashed password in database', async () => {
    await postUser();
    //query user table
    const userList = await User.findAll();
    const savedUser = userList[0];
    const res = await bcrypt.compare(validUser.password, savedUser.password);
    expect(res).toBe(true);
  });

  it('returns 400 Bad Request when username is null', async () => {
    const response = await postUser({ ...validUser, username: null });
    expect(response.status).toBe(400);
  });

  it('returns validationErrors in request body when validation errors occur', async () => {
    const response = await postUser({ ...validUser, username: null });
    expect(response.body.validationErrors).not.toBeUndefined();
  });
});

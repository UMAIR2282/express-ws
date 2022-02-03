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
  username: 'username1',
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
    expect(response.body.message).toBeDefined();
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

  it("Doesn't return validationErrors field in response body when validation error does not occur", async () => {
    const response = await postUser();
    expect(response.body.validationErrors).not.toBeDefined();
  });

  it('returns validationErrors field in response body when validation errors occur', async () => {
    const response = await postUser({ ...validUser, username: null });
    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it.each([['username'], ['email'], ['password']])('returns 400 Bad Request when %s is null', async (field) => {
    const user = { ...validUser };
    user[field] = null;
    const response = await postUser(user);
    expect(response.status).toBe(400);
  });

  it.each`
    field         | expectedMessage
    ${'username'} | ${'Username cannot be null'}
    ${'email'}    | ${'Email cannot be null'}
    ${'password'} | ${'Password cannot be null'}
  `('returns $expectedMessage error when $field is null', async ({ field, expectedMessage }) => {
    const user = { ...validUser };
    user[field] = null;
    const response = await postUser(user);
    expect(response.body.validationErrors[field]).toBe(expectedMessage);
  });

  it('returns error for all when username, email, and password is null', async () => {
    const response = await postUser({ username: null, email: null, password: null });
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email', 'password']);
  });

  it('returns size validation error when username is less than 6 characters', async () => {
    const field = 'username';
    const expectedMessage = 'Username cannot be less than 6 and more than 32 characters';
    const user = { ...validUser };
    user[field] = 'user1';
    const response = await postUser(user);
    expect(response.body.validationErrors[field]).toBe(expectedMessage);
  });
});

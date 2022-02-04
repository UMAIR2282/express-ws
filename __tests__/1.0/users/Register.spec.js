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
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${'Username cannot be null'}
    ${'username'} | ${'user1'}         | ${'Username cannot be less than 6 and more than 32 characters'}
    ${'username'} | ${'a'.repeat(33)}  | ${'Username cannot be less than 6 and more than 32 characters'}
    ${'email'}    | ${null}            | ${'Email cannot be null'}
    ${'email'}    | ${'mail.com'}      | ${'Email is not Valid'}
    ${'email'}    | ${'user.mail.com'} | ${'Email is not Valid'}
    ${'email'}    | ${'user@mail'}     | ${'Email is not Valid'}
    ${'password'} | ${null}            | ${'Password cannot be null'}
    ${'password'} | ${'P4ssw'}         | ${'Password cannot be less than 8 and more than 128 characters'}
    ${'password'} | ${'alllowercase'}  | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'}  | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'NoNumber'}      | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'l0wernumber'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'UPPER4UMBER'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'12345678'}      | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'P'.repeat(129)} | ${'Password cannot be less than 8 and more than 128 characters'}
  `('returns $expectedMessage error when $field is $value', async ({ field, value, expectedMessage }) => {
    const user = { ...validUser };
    user[field] = value;
    const response = await postUser(user);
    expect(response.body.validationErrors[field]).toBe(expectedMessage);
  });

  it('returns error for all when username, email, and password is null', async () => {
    const response = await postUser({ username: null, email: null, password: null });
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email', 'password']);
  });

  it('returns Email is in use when same email is already in use', async () => {
    await postUser();
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe('Email is in use');
  });

  it('returns errors for both username is null and Email is in use', async () => {
    await postUser();
    const user = { ...validUser };
    user['username'] = null;
    const response = await postUser(user);
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);

  });
});

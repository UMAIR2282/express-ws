const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/domains/users/models/User');
const sequelize = require('../../../src/config/database');
const bcrypt = require('bcryptjs');

beforeAll(() => {
  return sequelize.sync({ force: true });
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'username1',
  email: 'user1@test.com',
  password: 'P@ssw0rd',
};

const postUser = (user = validUser, options = { language: 'en' }) => {
  const agent = request(app).post('/api/1.0/users');
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return agent.send(user);
};

describe('User Registration', () => {
  const user_created = 'User Created';
  const username_null = 'Username cannot be null';
  const username_size = 'Username cannot be less than 6 and more than 32 characters';
  const email_null = 'Email cannot be null';
  const email_inuse = 'Email is in use';
  const email_invalid = 'Email is not Valid';
  const password_null = 'Password cannot be null';
  const password_size = 'Password cannot be less than 8 and more than 128 characters';
  const password_pattern = 'Password must have at least 1 uppercase, 1 lowercase, and 1 number';

  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(201);
  });

  it(`returns success message ${user_created} when signup request is valid`, async () => {
    const response = await postUser();
    expect(response.body.message).toBe(user_created);
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
    ${'username'} | ${null}            | ${username_null}
    ${'username'} | ${'user1'}         | ${username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size}
    ${'email'}    | ${null}            | ${email_null}
    ${'email'}    | ${'mail.com'}      | ${email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${email_invalid}
    ${'email'}    | ${'user@mail'}     | ${email_invalid}
    ${'password'} | ${null}            | ${password_null}
    ${'password'} | ${'P4ssw'}         | ${password_size}
    ${'password'} | ${'P'.repeat(129)} | ${password_size}
    ${'password'} | ${'alllowercase'}  | ${password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}  | ${password_pattern}
    ${'password'} | ${'NoNumber'}      | ${password_pattern}
    ${'password'} | ${'l0wernumber'}   | ${password_pattern}
    ${'password'} | ${'UPPER4UMBER'}   | ${password_pattern}
    ${'password'} | ${'12345678'}      | ${password_pattern}
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

  it(`returns ${email_inuse} when same email is already in use`, async () => {
    await postUser();
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it(`returns errors for both username is null and ${email_inuse}`, async () => {
    await postUser();
    const user = { ...validUser };
    user['username'] = null;
    const response = await postUser(user);
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);
  });

  it('creates user in inactive mode', async () => {
    await postUser();
    //query user table
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.inactive).toBe(true);
  });

  it('creates user in inactive mode even when body contains inactive as false', async () => {
    const user = { ...validUser, inactive: false };
    await postUser(user);
    //query user table
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.inactive).toBe(true);
  });

  it('creates an activationToken for user', async () => {
    await postUser();
    //query user table
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.activationToken).toBeTruthy();
  });
});

describe('Internationalization', (options = { language: 'ur' }) => {
  const user_created = 'صارف بن گیا ہے';
  const username_null = 'صارف کا نام خالی نہیں ہونا چاہیے';
  const username_size = 'صارف نام 6 سے کم اور 32 حروف سے زیادہ نہیں ہو سکتا';
  const email_null = 'ای میل خالی نہیں ہونا چاہیے';
  const email_inuse = 'ای میل استعمال میں ہے';
  const email_invalid = 'ای میل درست نہیں ہے';
  const password_null = 'پاس ور خالی نہیں ہونا چاہیے';
  const password_size = 'پاس ورڈ 8 سے کم اور 128 حروف سے زیادہ نہیں ہو سکتا';
  const password_pattern = 'پاس ورڈ میں کم از کم 1 بڑے، 1 چھوٹے اور 1 نمبر کا ہونا ضروری ہے';

  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${username_null}
    ${'username'} | ${'user1'}         | ${username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size}
    ${'email'}    | ${null}            | ${email_null}
    ${'email'}    | ${'mail.com'}      | ${email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${email_invalid}
    ${'email'}    | ${'user@mail'}     | ${email_invalid}
    ${'password'} | ${null}            | ${password_null}
    ${'password'} | ${'P4ssw'}         | ${password_size}
    ${'password'} | ${'P'.repeat(129)} | ${password_size}
    ${'password'} | ${'alllowercase'}  | ${password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}  | ${password_pattern}
    ${'password'} | ${'NoNumber'}      | ${password_pattern}
    ${'password'} | ${'l0wernumber'}   | ${password_pattern}
    ${'password'} | ${'UPPER4UMBER'}   | ${password_pattern}
    ${'password'} | ${'12345678'}      | ${password_pattern}
  `(
    'returns $expectedMessage error when $field is $value when language is set as Urdu',
    async ({ field, value, expectedMessage }) => {
      const user = { ...validUser };
      user[field] = value;
      const response = await postUser(user, options);
      expect(response.body.validationErrors[field]).toBe(expectedMessage);
    }
  );

  it(`returns ${email_inuse} when same email is already in use when language is set as Urdu`, async () => {
    await postUser();
    const response = await postUser(validUser, options);
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it(`returns success message ${user_created} when signup request is valid when language is set as Urdu`, async () => {
    const response = await postUser(validUser, options);
    expect(response.body.message).toBe(user_created);
  });
});

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

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@test.com',
        password: 'P@ssw0rd',
      })
      .then((response) => {
        expect(response.status).toBe(201);
        done();
      });
  });

  it('returns success message when signup request is valid', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@test.com',
        password: 'P@ssw0rd',
      })
      .then((response) => {
        expect(response.body.message).toBe('User Created');
        done();
      });
  });

  it('saves the user to database', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@test.com',
        password: 'P@ssw0rd',
      })
      .then(() => {
        //query user table
        User.findAll().then((userList) => {
          expect(userList.length).toBe(1);
        });
        done();
      });
  });

  it('saves the username and email to database', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@test.com',
        password: 'P@ssw0rd',
      })
      .then(() => {
        //query user table
        User.findAll().then((userList) => {
          const savedUser = userList[0];
          expect(savedUser.username).toBe('user1');
          expect(savedUser.email).toBe('user1@test.com');
        });
        done();
      });
  });

  it('hashes the password in database', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@test.com',
        password: 'P@ssw0rd',
      })
      .then(() => {
        //query user table
        User.findAll().then((userList) => {
          const savedUser = userList[0];
          expect(savedUser.password).not.toBe('P@ssw0rd');
        });
        done();
      });
  });

  it('compare hashed password in database', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@test.com',
        password: 'P@ssw0rd',
      })
      .then(() => {
        //query user table
        User.findAll().then((userList) => {
          const savedUser = userList[0];
          bcrypt.compare('P@ssw0rd', savedUser.password, function (err, res) {
            // res === true
            expect(res).toBe(true);
          });
        });
        done();
      });
  });
});

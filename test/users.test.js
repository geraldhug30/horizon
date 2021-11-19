const request = require('supertest');
const app = require('../app.js');
const User = require('../model/Users');

const { setupDB } = require('./fixtures/db');
// should log in Rion
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVhMzkxZTMxZWVmNjcwOGZjMzk2ZGE0IiwiZmlyc3ROYW1lIjoicmlvbiIsInBvc2l0aW9uIjoiUmV2aWV3ZXIifSwiaWF0IjoxNTg4MTY1Mjg5LCJleHAiOjE1ODg1MjUyODl9.5BQwY9kKkuZZoStHaldip-Myxy3-99ws4s-2qpiEN40';

beforeEach(setupDB);

describe('Users Testing', () => {
  test('Should Register an account', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        firstName: 'gerald',
        lastName: 'hug',
        email: 'gerald_hug1730@gmail.com',
        position: 'Admin',
        password: '123456',
      })
      .expect(200);
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull(); // not null
    // Assertion abou the response using object
    expect(response.body).toMatchObject({
      user: {
        firstName: 'gerald',
        lastName: 'hug',
        email: 'gerald_hug1730@gmail.com',
      },
    });
    // should hash password
    expect(user.password).not.toBe('123456');
  });

  test('Should Check dupplicate register', async () => {
    await request(app)
      .post('/api/users')
      .send({
        firstName: 'gerald',
        lastName: 'hug',
        email: 'gerald_hug92@gmail.com',
        position: 'Admin',
        password: '123456',
      })
      .expect(401);
  });

  test('Should Check Error/Incomplete Registry and should Failed', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'gerald_hug1730@gmail.com',
        position: 'Admin',
        password: '123456',
      })
      .expect(422);

    await request(app)
      .post('/api/users')
      .send({
        firstName: 'gerald',
        email: 'gerald_hug1730@gmail.com',
        position: 'Admin',
        password: '123456',
      })
      .expect(422);

    await request(app)
      .post('/api/users')
      .send({
        firstName: 'gerald',
        lastName: 'hug',
        position: 'Admin',
        password: '123456',
      })
      .expect(422);

    await request(app)
      .post('/api/users')
      .send({
        firstName: 'gerald',
        lastName: 'hug',
        email: 'gerald_hug92@gmail.com',
        password: '123456',
      })
      .expect(422);

    await request(app)
      .post('/api/users')
      .send({
        firstName: 'gerald',
        lastName: 'hug',
        email: 'gerald_hug92@gmail.com',
        position: 'Admin',
      })
      .expect(422);

    await request(app).post('/api/users').send({}).expect(422);
  });

  test('Should Get All Database User', async () => {
    await request(app).get('/api/users/allData').send().expect(200);
  });

  test('Should login a User', async () => {
    await request(app)
      .post('/api/auth')
      .send({
        email: 'gerald_hug92@gmail.com',
        password: '123456',
      })
      .expect(200);

    await request(app)
      .post('/api/auth')
      .send({
        email: 'rion92@gmail.com',
        password: '123456',
      })
      .expect(200);
  });
  test('Should check Failed logins', async () => {
    await request(app)
      .post('/api/auth')
      .send({
        email: 'gerald_hug1730@gmail.com',
        password: '',
      })
      .expect(422);

    await request(app)
      .post('/api/auth')
      .send({
        email: 'gerald_hug1730@gmail.com',
        password: '123456',
      })
      .expect(400);
  });
  test('Should get User account', async () => {
    await request(app)
      .get('/api/auth')
      .set({
        'x-auth-token': token,
      })
      .send()
      .expect(200);
  });

  test('Should edit users', async () => {
    const response = await request(app)
      .patch('/api/users')
      .set({
        'x-auth-token': token,
      })
      .send({
        firstName: 'Gerald',
        lastName: 'Hug',
        password: 'Arvato123',
      })
      .expect(200);
    // check update data in database
    const user = await User.findById(response.body._id);
    expect(user.firstName).toBe('Gerald');
    expect(user.lastName).toBe('Hug');
    expect(user.password).not.toBe('Arvato123');
  });

  test('Should upload avatar image', async () => {
    // dummyTest2 id error: Token must be expired and need to get new token. After Get the user id to change it on mock db.js
    const testUser = await request(app)
      .post('/api/users/avatar')
      .set({
        'x-auth-token': token,
      })
      .attach('upload', 'test/fixtures/dog.jpg')
      .expect(200);

    const user = await User.findById(testUser.body.user._id);
    expect(user.avatar).toEqual(expect.any(Buffer));
  });

  test('Should Delete users account', async () => {
    await request(app)
      .delete('/api/users/delete')
      .set({
        'x-auth-token': token,
      })
      .send()
      .expect(200);
  });
});

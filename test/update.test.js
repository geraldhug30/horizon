const request = require('supertest');
const app = require('../app');
const HorizonUpdate = require('../model/HorizonUpdates');

const { setupDB, dummyTest1Id, dummyTestHUpdateId } = require('./fixtures/db');

beforeEach(setupDB);

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVhMzkxZTMxZWVmNjcwOGZjMzk2ZGE0IiwiZmlyc3ROYW1lIjoicmlvbiIsInBvc2l0aW9uIjoiUmV2aWV3ZXIifSwiaWF0IjoxNTg4MTY1Mjg5LCJleHAiOjE1ODg1MjUyODl9.5BQwY9kKkuZZoStHaldip-Myxy3-99ws4s-2qpiEN40';

describe('Horizon updates test', () => {
  it('should get horizon update', async () => {
    await request(app).get('/api/updates/allData').send().expect(200);
  });
  // id error: Token must be expired and need to get new token. After Get the user id to change it on mock db.js
  it('should get one horizon data', async () => {
    await request(app)
      .get(`/api/updates/${dummyTestHUpdateId}`)
      .set({
        'x-auth-token': token,
      })
      .send()
      .expect(200);
  });

  it('should post a new horizon update', async () => {
    const response = await request(app)
      .post(`/api/updates/`)
      .set({
        'x-auth-token':
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVhMzkxZTMxZWVmNjcwOGZjMzk2ZGE0IiwiZmlyc3ROYW1lIjoicmlvbiIsInBvc2l0aW9uIjoiUmV2aWV3ZXIifSwiaWF0IjoxNTg4MTY1Mjg5LCJleHAiOjE1ODg1MjUyODl9.5BQwY9kKkuZZoStHaldip-Myxy3-99ws4s-2qpiEN40',
      })
      .send({
        updateBody: 'This is from test 123456',
        owner: dummyTest1Id,
      })
      .expect(201);

    const horizonUpdate = await HorizonUpdate.findById(response.body._id);
    expect(horizonUpdate).not.toBeNull();
    expect(horizonUpdate.posted).toEqual(false);
  });

  it('should update or patch one horizon data', async () => {
    const response = await request(app)
      .patch(`/api/updates/${dummyTestHUpdateId}`)
      .set({
        'x-auth-token': token,
      })
      .send({ updateBody: 'this is from test patch change' })
      .expect(200);

    const horizonUpdate = await HorizonUpdate.findById(response.body._id);
    expect(horizonUpdate).not.toBeNull();
    expect(horizonUpdate.posted).toEqual(false);
    expect(horizonUpdate.updateBody).toEqual(response.body.updateBody);
  });

  it('should delete one horizon data', async () => {
    await request(app)
      .delete(`/api/updates/${dummyTestHUpdateId}`)
      .set({
        'x-auth-token': token,
      })
      .send()
      .expect(200);
  });
});

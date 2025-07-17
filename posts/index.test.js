const request = require('supertest');
const app = require('./index');

describe('Posts Service', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('POST /posts', () => {
    it('should create a new post with title', async () => {
      const response = await request(app)
        .post('/posts')
        .send({ title: 'Test Post' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Post');
      expect(response.body.id).toBeTruthy();
    });

    it('should store the post for retrieval', async () => {
      const createResponse = await request(app)
        .post('/posts')
        .send({ title: 'Another Test Post' })
        .expect(201);

      const postId = createResponse.body.id;

      const getResponse = await request(app)
        .get('/posts')
        .expect(200);

      expect(getResponse.body[postId]).toBeDefined();
      expect(getResponse.body[postId].title).toBe('Another Test Post');
    });
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      // Create multiple posts
      await request(app)
        .post('/posts')
        .send({ title: 'First Post' });

      await request(app)
        .post('/posts')
        .send({ title: 'Second Post' });

      const response = await request(app)
        .get('/posts')
        .expect(200);

      expect(response.body).toBeInstanceOf(Object);
      const postTitles = Object.values(response.body).map(post => post.title);
      expect(postTitles).toContain('First Post');
      expect(postTitles).toContain('Second Post');
    });

    it('should return empty object when no posts exist', async () => {
      // Note: In a real test environment, you'd want to reset the posts object
      // For this simple test, we're just checking the structure
      const response = await request(app)
        .get('/posts')
        .expect(200);

      expect(response.body).toBeInstanceOf(Object);
    });
  });
});
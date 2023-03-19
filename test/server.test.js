const expect = require('chai').expect;
const request = require('supertest');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');


const {app} = require('../server');
const UserModel = require("../models/user");
const CommentModel = require("../models/comment");
const PostModel = require("../models/post");
const {posts, addDummyPosts, users,  addDummyUsers} = require('./seed')


const authtoken1 = jwt.sign({user:{id: users[0]._id}}, process.env.JWT_SECRET);
const authtoken2 = jwt.sign({user:{id: users[1]._id}}, process.env.JWT_SECRET);


beforeEach(addDummyUsers);
beforeEach(addDummyPosts);

let req1_post_id;

describe('POST /api', () => {
  it('would add a new post created by the authenticated user', (done) => {
    var text = {
      "title" : "New post",
      "description": "Elephant is mammal"
    }

      request(app)
      .post('/api/posts')
      .set('auth-token', authtoken1)
      .send(text)
      .expect((res) => {
        req1_post_id = res.body.post_id;
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('post_id');
        expect(res.body).to.have.property('title');
      })
      .end((err, res) => {
        if(err) return done(err);

        PostModel.findById(res.body.post_id).then((post) => {
          expect(post.title).to.equal(text.title);
          expect(post.description).to.equal(text.description);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it('should make person1 follower of person2', (done) => {
    request(app)
      .post(`/api/follow/${users[1].username}`)
      .set('auth-token', authtoken1)
      .expect((res) => {
        expect(res.status).to.equal(200);
      })
      .end((err, res) => {
        if(err) return done(err);

        done();
      });
  });

  it('should make person1 follower of person2', (done) => {
    request(app)
      .post(`/api/unfollow/${users[1].username}`)
      .set('auth-token', authtoken1)
      .expect((res) => {
        expect(res.status).to.equal(200);
      })
      .end((err, res) => {
        if(err) return done(err);

        done();
      });
  });

  it('should authenticate the request and return the respective user profile', (done) => {
    request(app)
      .get(`/api/user`)
      .set('auth-token', authtoken1)
      .expect((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('followers');
        expect(res.body).to.have.property('followings');
      })
      .end((err, res) => {
        if(err) return done(err);

        done();
      });
  });

  it('would delete post with {id} created by the authenticated user', (done) => {
    request(app)
      .delete(`/api/posts/${posts[0]._id}`)
      .set('auth-token', authtoken1)
      .expect((res) => {
        expect(res.status).to.equal(200);
      })
      .end((err, res) => {
        if(err) return done(err);

        done();
      });
  });
});
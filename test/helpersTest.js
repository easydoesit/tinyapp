const { assert } = require('chai');

const { userLookUpByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = userLookUpByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert(user === expectedUserID, "user has valid email");

  });
  it('should return a undefined with invalid email', function() {
    const user = userLookUpByEmail("me@me.com", testUsers);
    const expectedUserID = undefined;

    assert(user === expectedUserID, "user is undefined");

  });
});
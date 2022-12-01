// look up user by email
const userLookUpByEmail = function(email, database) {
  let userID;
  
  for (let key of Object.keys(database)) {

    if (database[key].email === email) {
      userID = key;
    }
  
  }

  return userID;

};

module.exports = {userLookUpByEmail};
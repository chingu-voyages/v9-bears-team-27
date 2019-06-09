const admin = require("firebase-admin");
const db = admin.firestore();

const firebase = require("firebase");

module.exports.signUp = async (req, res) => {
  let token;
  let uid;
  let documentExists = false;
  await db
    .doc(`/users/${req.body.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        documentExists = true;
      }
    });

  if (documentExists)
    return res.status(400).json({ username: `This Username is already taken` });

  //If document doesn't exist, continue to sign-up the user
  firebase
    .auth()
    //Authenticating the user
    .createUserWithEmailAndPassword(req.body.email, req.body.password)
    .then(data => {
      uid = data.user.uid;
      return data.user.getIdToken();
    })
    .then(localToken => {
      token = localToken;
      //Also Adding the User Document to Firestore Database
      const newUser = {
        userId: uid,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        joinedAt: admin.firestore.Timestamp.fromDate(new Date())
      };
      // Setting the ID of doc same as the username
      return db.doc(`/users/${newUser.username}`).set(newUser);
    })
    .then(() => res.status(201).json({ token }))
    .catch(err => {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        // Client-side Error, so status 400
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

module.exports.signIn = async (req, res) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then(data => data.user.getIdToken())
    .then(token => res.status(200).json({ token }))
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.code });
    });
};

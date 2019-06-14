const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const config = require("./config.js");

const firebaseConfig = config.firebaseConfig; // Firebase App Config here

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const app = require("express")();

const authRoutes = require("./routes/authRoutes.js");

app.post("/signup", authRoutes.signUp);
app.post("/signin", authRoutes.signIn);

module.exports.api = functions.https.onRequest(app);

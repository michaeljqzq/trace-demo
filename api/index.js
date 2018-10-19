const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
// const cors = require('cors');
const data = require('./data');
// const fake = require('./fake');
const backend = require('./backend');

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

const _username = process.env.AUTH_USERNAME;
const _password = process.env.AUTH_PASSWORD;

let jwtOptions = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "1f654a21133f766e176de325482591d1",
}

let jwtStrategy = new passportJWT.Strategy(jwtOptions, (jwt_payload, next) => {
  if (jwt_payload.username === _username) {
    next(null, _username);
  } else {
    next(null, false);
  }
});

app.post(`/api/login`, (req, res) => {
  let { username, password } = req.body;
  console.log(username,password)
  if(username === _username && password === _password) {
    let token = jwt.sign({username}, jwtOptions.secretOrKey);
    res.json({
      token
    });
  }else {
    res.status(401).end();
  }
});

passport.use(jwtStrategy);

let auth = passport.authenticate('jwt', {session:false});
app.use(auth);

app.use('/api/data', data);
// app.use('/api/fake', fake);
app.use('/api/backend', backend);

app.use(express.static('.'));

app.listen(process.env.PORT || 3001, null, null, () => {
  console.log('listening on ' + (process.env.PORT || 3001));
});
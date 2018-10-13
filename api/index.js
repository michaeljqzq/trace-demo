const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

const data = require('./data');
const fake = require('./fake');
const backend = require('./backend');

const app = express();
app.use(bodyParser.json());

app.use('/api/data', data);
app.use('/api/fake', fake);
app.use('/api/backend', backend);

app.use(express.static('.'));

app.listen(process.env.PORT || 3001, null, null, () => {
  console.log('listening on ' + (process.env.PORT || 3001));
});
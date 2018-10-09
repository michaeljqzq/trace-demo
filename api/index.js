const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

const fake = require('./fake');

const app = express();
app.use(bodyParser.json());

app.use('/api/fake', fake);

app.use(express.static('.'));

app.listen(process.env.PORT || 3001, null, null, () => {
  console.log('listening on ' + (process.env.PORT || 3001));
});
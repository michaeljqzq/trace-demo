var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
var multer  = require('multer');
var upload = multer({})

router.get('/background', (req, res) => {
  res.json({
    url: process.env.BACKGROUND_URL
  });
});

router.post('/background', upload.single('file'), (req, res) => {
  try {
    if(!fs.existsSync(path.resolve(__dirname, 'upload'))) {
      fs.mkdirSync(path.resolve(__dirname, 'upload'));
    }
    fs.writeFileSync(path.resolve(__dirname, 'upload/background-image'), req.file.buffer);
  }catch(e) {
    res.status(500).send(JSON.stringify(e));
  }
  res.sendStatus(200);
});

module.exports = router;
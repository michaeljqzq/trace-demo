var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
var multer  = require('multer');
var upload = multer({})

router.get('/background', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'upload/background-image'));
});

router.post('/background', upload.single('file'), (req, res) => {
  try {
    fs.writeFileSync(path.resolve(__dirname, 'upload/background-image'), req.file.buffer);
  }catch(e) {
    res.status(500).send(JSON.stringify(e));
  }
  res.sendStatus(200);
});

module.exports = router;
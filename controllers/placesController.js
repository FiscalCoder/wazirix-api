/* eslint-disable prefer-template */

import multer from 'multer';
import fs from 'fs';
import path from 'path';
import database from '../config/database';
import config from '../config/configuration'

const { log } = console;
const bodyError = 'There is some problem in server. Kindly contact your administrator.'

function dbCall(sql, data) {
  return new Promise((resolve, reject) => {
    database.query(sql, data, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    });
  });
}

function sendRes(res, code, result, type, message) {
  let warn = 36
  let ifErr = false
  if (code >= 400) {
    this.log(result, message)
    warn = 33
    ifErr = true
  }

  log(`\x1b[4m\x1b[1m\x1b[${warn}m${message}${ifErr ? '\n\n' + result : ''}\x1b[89m\x1b[22m\x1b[24m\x1b[0m`)

  res.status(code).send({
    code,
    result,
    type,
    message,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dir = './public/places/'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)

    callback(null, dir);
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single('file');

function addPlaces(req, res) {
  if (!req.body) sendRes(res, 400, new Error('Values are needed'), 'error', bodyError)
  else {
    upload(req, res, (err) => {
      if (err) sendRes(res, 500, err, 'error', 'There is some problem while uploading file')

      let file;
      if (req.file) file = req.protocol + '://' + req.hostname + config.imagePath + 'public/places/' + req.file.filename;

      const formValues = JSON.parse(req.body.formValues);
      console.log(formValues)
      console.log(file)
    })
  }
}

export default {
  addPlaces,
}

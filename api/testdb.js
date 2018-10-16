var express = require('express');
var router = express.Router();
const uuid = require('uuid/v4');
const cosmos = require('@azure/cosmos');
const CosmosClient = cosmos.CosmosClient;
const constant = require('../src/constant');
var memoryCache = require('memory-cache');

const client = new CosmosClient({
  endpoint: "",
  auth: {
    masterKey: ""
  }
});

const databaseDefinition = {
  id: 'ZhiqingTestDB'
};
const collectionDefinition = {
  id: 'ZhiqingTestCollection'
};

let database = null;
let container = null;

async function init() {
  database = (await client.databases.createIfNotExists(databaseDefinition)).database;
  console.log('init db');
  container = (await database.containers.createIfNotExists(collectionDefinition)).container;
}
init();

async function write() {
  if (!database) database = (await client.databases.createIfNotExists(databaseDefinition)).database;
  if (!container) container = (await database.containers.createIfNotExists(collectionDefinition)).container;
  const {
    item
  } = await container.items.create({
    timestamp: Date.now()
  });
}

async function read() {
  if (!database) {
    database = (await client.databases.createIfNotExists(databaseDefinition)).database;
  }

  if (!container) container = (await database.containers.createIfNotExists(collectionDefinition)).container;

  let result = (await container.items.query(`SELECT * FROM c order by c.timestamp`).toArray()).result;
  console.log(result.length)
  if (result.length !== 0) {
    console.log(`Gap is ${Date.now() - result[result.length-1].timestamp} ms.`);
  }
}

setInterval(async()=>{
  try{
    await write()
  }catch(e) {
    console.log("Error", e)
  }
}, 200);
setInterval(async()=>{
  try{
    await read()
  }catch(e) {
    console.log("Error", e)
  }
}, 200);

module.exports = router;
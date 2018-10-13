var express = require('express');
var router = express.Router();
const uuid = require('uuid/v4');

const cosmos = require('@azure/cosmos');
const CosmosClient = cosmos.CosmosClient;
const constant = require('../src/constant');
 
const client = new CosmosClient({ endpoint: constant.DB_HOST, auth: { masterKey: constant.DB_KEY } });
 
const databaseDefinition = { id: constant.DB_DATABASE_ID };
const collectionDefinition = { id: constant.DB_COLLECTION_ID };
const documentDefinition = { id: 'hello world doc', content: 'Hello World!' };

let database = null;
let container = null;
 
async function insertData(item) {
  if(!database) database = (await client.databases.createIfNotExists(databaseDefinition)).database;
 
  if(!container) container = (await database.containers.createIfNotExists(collectionDefinition)).container;
 
  await container.items.create(item);
}

async function clear() {
  if(!database) database = (await client.databases.createIfNotExists(databaseDefinition)).database;
 
  if(!container) container = (await database.containers.createIfNotExists(collectionDefinition)).container;
 
  await container.delete();
}

const NUM_OF_PEOPLE = 3;
const MAXX = constant.CAMERA_LIMIT_X;
const MAXY = constant.CAMERA_LIMIT_Y;
const MAXSPEED = 50;
const MINSPEED = 30;
const DIR_CHANGE_RATE = 20;
const PUSH_TO_DB = false;

let peoples = new Map();
for (let i = 0; i < NUM_OF_PEOPLE; i++) {
  peoples.set(uuid(), {points:[]});
}

async function init() {
  for (let [k,v] of peoples) {
    let deltaX = Math.random() * MAXSPEED * 2 - MAXSPEED;
    let deltaY = Math.random() * MAXSPEED * 2 - MAXSPEED;
    while(Math.abs(deltaX) < MINSPEED) {
      deltaX = Math.random() * MAXSPEED * 2 - MAXSPEED;
    }
    while(Math.abs(deltaY) < MINSPEED) {
      deltaY = Math.random() * MAXSPEED * 2 - MAXSPEED;
    }
    let data = {
      camera_id: 1,
      track_id: k,
      track_score: 1,
      global_position: null,
      local_position: {
        x: Math.random() * MAXX,
        y: Math.random() * MAXY,
      },
      timestamp: Date.now(),
      deltaX: (Math.random() * MAXSPEED * 2 - MAXSPEED),
      deltaY: (Math.random() * MAXSPEED * 2 - MAXSPEED),
    };
    v.points.push(data);
    if(PUSH_TO_DB) {
      await insertData(data);
    }
  }
}

async function generateRandomPoint() {
  for (let [k,v] of peoples) {
    let lastPoint = v.points[v.points.length-1];
    if(lastPoint == undefined) return;
    let deltaX = lastPoint.deltaX + (Math.random() - 0.5) * DIR_CHANGE_RATE;
    let deltaY = lastPoint.deltaY + (Math.random() - 0.5) * DIR_CHANGE_RATE;
    let x = lastPoint.local_position.x + lastPoint.deltaX;
    if(x<0) x=0;
    if(x>MAXX) x= MAXX;
    let y = lastPoint.local_position.y + lastPoint.deltaY;
    if(y<0) y=0;
    if(y>MAXY) y= MAXY;
    let data = {
      camera_id: 1,
      track_id: k,
      track_score: 1,
      global_position: null,
      timestamp: Date.now(),
      local_position: {
        x: x,
        y: y,
      },
      deltaX,
      deltaY,
    }
    v.points.push(data);
    console.log(data.track_id)
    if(PUSH_TO_DB) {
      await insertData(data);
    }
  }
}

let interval;

router.get('/', (req, res) => {
  let values = [];
  for(let [k,v] of peoples) {
    values.push(...v.points);
  }
  res.json({
    values,
    scope: {
      // minX: 0,
      maxX: MAXX,
      // miny: 0,
      maxY: MAXY,
    }
  });
});

router.get('/start', (req, res) => {
  init();
  interval = setInterval(generateRandomPoint, 1000);
  res.json({
    
  });
});

router.get('/stop', (req, res) => {
  clearInterval(interval);
  res.json({
    
  });
});

router.get('/clear', (req, res) => {
  clear();
  res.json({
    
  });
});


module.exports = router;
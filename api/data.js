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
let cache = {
  start: null,
  end: null,
  lastTimestamp: null,
  data: []
}
let requestInProgress = false;
 
async function query(start, end) {
  if(!database) {database = (await client.databases.createIfNotExists(databaseDefinition)).database; console.log('init db')}
 
  if(!container) container = (await database.containers.createIfNotExists(collectionDefinition)).container;

  let condition = '';
  if(start != undefined && end != undefined) {
    condition = `WHERE c.timestamp >= ${start} and c.timestamp <=${end}`;
  }

  console.log(`query: SELECT * FROM c ${condition} order by c.timestamp`);
 
  return await container.items.query(`SELECT * FROM c ${condition} order by c.timestamp`).toArray();
  // let r =  await container.items.query(`SELECT * FROM c `).toArray();
  // console.log(JSON.stringify(r));
  // return [];
}

function withCache(queryFunc) {
  return async function(start, end) {
    try {
      let os = start, oe = end;
      if (cache.start === start && cache.end === end) {
        start = cache.lastTimestamp;
      } else {
        cache = {
          start: start,
          end: end,
          lastTimestamp: null,
          data: []
        }
      }
      if (requestInProgress) {
        return {result: []};
      }
      requestInProgress = true;
      let queryResult = await queryFunc(start, end);
      requestInProgress = false;
      let lastTimestamp = new Date(-8640000000000000);
      for (let point of queryResult.result) {
        if (point.timestamp > lastTimestamp) lastTimestamp = point.timestamp;
      }
      cache.lastTimestamp = lastTimestamp;
      cache.data.push(...queryResult.result);
      return {result: cache.data};
    } catch (e) {
      requestInProgress = false;
      console.log(`Error: ${JSON.stringify(e)}`);
      return {result: []};
    }
  }
}

// async function run() {
//   let a = await query();
//   console.log(a);
// }
// run();

//   v.points.push({
//     id: k,
//     time: Date.now(),
//     x: Math.random() * MAXX,
//     y: Math.random() * MAXY,
//     deltaX: (Math.random() * MAXSPEED * 2 - MAXSPEED),
//     deltaY: (Math.random() * MAXSPEED * 2 - MAXSPEED),
//   });
// }

async function queryData(start, end) {
  try{ 
    let now = new Date();
    let result = await withCache(query)(start, end);
    console.log(`Take ${(new Date() - now)/1000}`)
  }
  catch(e) {
    console.log(`Error: ${JSON.stringify(e)}`);
  }
}

async function stressTest() {
  let now = new Date();
  setInterval(async () => {
    queryData(now - 1000 * 86400, +now);
  },1000);
  // queryData(now - 1000 * 86400, +now);
}

// stressTest();

router.get('/', async (req, res) => {
  let {result : values} = await withCache(query)(parseInt(req.query.start), parseInt(req.query.end));
  
  values = values.map(p => ({
    id: p.track_id,
    time: p.timestamp,
    x: p.local_position.x,
    y: p.local_position.y,
  }));  
  res.json({
    values,
    scope: {
      // minX: 0,
      maxX: constant.CAMERA_LIMIT_X,
      // miny: 0,
      maxY: constant.CAMERA_LIMIT_Y,
    }
  });
});

module.exports = router;
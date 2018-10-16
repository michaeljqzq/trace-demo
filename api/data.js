var express = require('express');
var router = express.Router();
const uuid = require('uuid/v4');
const cosmos = require('@azure/cosmos');
const CosmosClient = cosmos.CosmosClient;
const constant = require('../src/constant');
var memoryCache = require('memory-cache');
 
const client = new CosmosClient({ endpoint: constant.DB_HOST, auth: { masterKey: constant.DB_KEY } });
 
const databaseDefinition = { id: constant.DB_DATABASE_ID };
const collectionDefinition = { id: constant.DB_COLLECTION_ID };
const documentDefinition = { id: 'hello world doc', content: 'Hello World!' };

const CACHE_KEY_DATA_CACHE = "dataCache";

let database = null;
let container = null;
let cache = {};
let initialized = false;
// {
//   start: null,
//   end: null,
//   lastTimestamp: null,
//   data: []
// }

async function init() {
  database = (await client.databases.createIfNotExists(databaseDefinition)).database; console.log('init db');
  container = (await database.containers.createIfNotExists(collectionDefinition)).container;
  memoryCache.put(CACHE_KEY_DATA_CACHE, {});
  initialized = true;
}
init();
 
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
      if(!initialized) await init();
      let cacheKey = start+'-'+end;
      let log = {};
      let allCache = memoryCache.get(CACHE_KEY_DATA_CACHE);
      let cacheItem = allCache[cacheKey];
      if (cacheItem) {
        start = cacheItem.lastTimestamp;
        // console.log('cache hit');
        log.cacheHit = true;
      } else {
        // console.log('cache miss');
        log.cacheHit = false;
      }
      if (memoryCache.get('requestInProgress')) {
        console.log(`There's a request in progress, skip`);
        log.skipThisRequest = true;
        return {result: [], log};
      }
      memoryCache.put('requestInProgress', true);
      // console.log('set flag to true')
      let queryResult = await queryFunc(start, end);
      memoryCache.put('requestInProgress', false);
      // console.log('set flag to false, query result is', JSON.stringify(queryResult))
      let lastTimestamp = queryResult.result[queryResult.result.length - 1].timestamp;
      for (let point of queryResult.result) {
        let t = parseInt(point.timestamp);
        if (t > lastTimestamp) lastTimestamp = t;
      }
      if(!cacheItem) {
        cacheItem = {
          start,
          end,
          lastTimestamp,
          data: queryResult.result
        }
      }else {
        cacheItem.lastTimestamp = lastTimestamp;
        for (let point of queryResult.result) {
          if(cacheItem.data.includes(point.id)){
            console.log(`Item duplicated with cache, skip`);
            continue;
          } 
          cacheItem.data.push(point);
        }
      }
      allCache[cacheKey] = cacheItem;
      memoryCache.put(CACHE_KEY_DATA_CACHE, allCache);
      
      return {result: cacheItem.data, log};
    } catch (e) {
      memoryCache.put('requestInProgress', false);
      console.log(`Error: ${(e)}`);
      return {result: [], log: {error: JSON.stringify(e)}};
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

// async function queryData(start, end) {
//   try{ 
//     let now = new Date();
//     let result = await withCache(query)(start, end);
//     console.log(`Take ${(new Date() - now)/1000}`)
//   }
//   catch(e) {
//     console.log(`Error: ${JSON.stringify(e)}`);
//   }
// }

// async function stressTest() {
//   let now = new Date();
//   setInterval(async () => {
//     queryData(now - 1000 * 86400, +now);
//   },1000);
//   // queryData(now - 1000 * 86400, +now);
// }

// stressTest();

const q = withCache(query);

router.get('/', async (req, res) => {
  let result = await q(parseInt(req.query.start), parseInt(req.query.end));
  let values = result.result;
  values = values.map(p => ({
    id: p.track_id,
    uuid: p.id,
    time: p.timestamp,
    x: p.local_position.x,
    y: p.local_position.y,
  }));  
  res.json({
    values,
    log: result.log,
    error: result.error,
    scope: {
      // minX: 0,
      maxX: constant.CAMERA_LIMIT_X,
      // miny: 0,
      maxY: constant.CAMERA_LIMIT_Y,
    }
  });
});

module.exports = router;
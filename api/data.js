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
 
async function query(start, end) {
  if(!database) {database = (await client.databases.createIfNotExists(databaseDefinition)).database; console.log('init db')}
 
  if(!container) container = (await database.containers.createIfNotExists(collectionDefinition)).container;

  let condition = '';
  if(start != undefined && end != undefined) {
    condition = `WHERE c.timestamp >= ${start} and c.timestamp <=${end}`;
  }
 
  return await container.items.query(`SELECT * FROM c ${condition} order by c.timestamp`).toArray();
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

router.get('/', async (req, res) => {
  let {result : values} = await query(req.query.start, req.query.end);
  
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
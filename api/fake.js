var express = require('express');
var router = express.Router();
const uuid = require('uuid/v4');

const NUM_OF_PEOPLE = 2;
const MAXX = 1000;
const MAXY = 600;
const MAXSPEED = 50;
const MINSPEED = 30;
const DIR_CHANGE_RATE = 20;

let peoples = new Map();
for (let i = 0; i < NUM_OF_PEOPLE; i++) {
  peoples.set(uuid(), {points:[]});
}

let points = [];
for (let [k,v] of peoples) {
  let deltaX = Math.random() * MAXSPEED * 2 - MAXSPEED;
  let deltaY = Math.random() * MAXSPEED * 2 - MAXSPEED;
  while(Math.abs(deltaX) < MINSPEED) {
    deltaX = Math.random() * MAXSPEED * 2 - MAXSPEED;
  }
  while(Math.abs(deltaY) < MINSPEED) {
    deltaY = Math.random() * MAXSPEED * 2 - MAXSPEED;
  }
  v.points.push({
    id: k,
    time: Date.now(),
    x: Math.random() * MAXX,
    y: Math.random() * MAXY,
    deltaX: (Math.random() * MAXSPEED * 2 - MAXSPEED),
    deltaY: (Math.random() * MAXSPEED * 2 - MAXSPEED),
  });
}

function generateRandomPoint() {
  for (let [k,v] of peoples) {
    let lastPoint = v.points[v.points.length-1];
    let deltaX = lastPoint.deltaX + (Math.random() - 0.5) * DIR_CHANGE_RATE;
    let deltaY = lastPoint.deltaY + (Math.random() - 0.5) * DIR_CHANGE_RATE;
    let x = lastPoint.x + lastPoint.deltaX;
    if(x<0) x=0;
    if(x>MAXX) x= MAXX;
    let y = lastPoint.y + lastPoint.deltaY;
    if(y<0) y=0;
    if(y>MAXY) y= MAXY;
    v.points.push({
      id: k,
      time: Date.now(),
      x,
      y,
      deltaX,
      deltaY,
    });
  }
}

setInterval(generateRandomPoint, 1000);

router.get('/', (req, res) => {
  let values = [];
  for(let [k,v] of peoples) {
    values.push(...v.points);
  }
  res.json({
    values,
    scope: {
      minX: 0,
      maxX: MAXX,
      miny: 0,
      maxY: MAXY,
    }
  });
});

module.exports = router;
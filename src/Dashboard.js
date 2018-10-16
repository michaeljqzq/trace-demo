import React, { Component } from 'react';
import './Dashboard.css';
import { Layer, Group, Line, Arc } from 'react-konva';
import Dot from './Dot';
import constant from './constant';
import util from './util';

// TODO:
// 0.2s to draw the trace
// shadow of real-time track
// split the line less than 40 seconds
// time selector hide in default
class Dashboard extends Component {
  state = {
    hoverElement: null,
  }

  cache = {
    activeColorMap: new Map()
  }

  config = {
    hoverOutDelayTimeout: null,
  }

  componentDidMount() {
    console.log('Dashboard component mounted');
  }

  getApiDomain() {
    // if(config.apiDomain) {
    //   return config.apiDomain;
    // }
    let domain = "https://" + window.location.hostname;
    return process.env.NODE_ENV === 'development' ? '' : domain;
  }

  onHoverElement = (id) => {
    console.log(id);
    if(this.config.hoverOutDelayTimeout) {
      clearTimeout(this.config.hoverOutDelayTimeout);
      this.config.hoverOutDelayTimeout = null;
    }
    this.setState({
      hoverElement: id
    });
  }

  onLeaveElement = () => {
    if(this.config.hoverOutDelayTimeout) {
      clearTimeout(this.config.hoverOutDelayTimeout);
    }
    this.config.hoverOutDelayTimeout = setTimeout(() => {
      this.setState({
        hoverElement: null
      });
    },300);
  }

  handlePoints = (pointArray) => {
    let p1 = performance.now();
    let pointMap = new Map();
    let colorUsedTimes = constant.COLOR_ACTIVE_SCHEMA.map(x=>0);
    let cMap = this.cache.activeColorMap;
    for(let point of pointArray) {
      if(!pointMap.has(point.id)) {
        pointMap.set(point.id, {
          points: []
        });
      }
      pointMap.get(point.id).points.push(point);
    }
    for(let [k,v] of pointMap) {
      let active = false;
      let now = Date.now();
     
      v.active = (now - v.points[v.points.length - 1].time < constant.ACTIVE_TIME_SPAN * 1000);

      if(v.active && cMap.has(k)) {
        colorUsedTimes[cMap.get(k)]++;
        v.colorSchema = cMap.get(k);
      }
    }
    for(let [k,v] of pointMap) {
      if(v.active && !cMap.has(k)) {
        let minTimes = colorUsedTimes[0];
        let minIndex = 0;
        for(let i=1;i<colorUsedTimes.length;i++) {
          if(colorUsedTimes[i]<minTimes) {
            minIndex = i;
            minTimes = colorUsedTimes[i];
          }
        }
        colorUsedTimes[minIndex]++;
        cMap.set(k, minIndex);
        v.colorSchema = minIndex;
      }
    }
    console.log(`Handle points use ${performance.now() - p1} ms`);
    return pointMap;
  }

  render() {
    // Set colors
    
    let pointMap = this.handlePoints(this.props.data);
    let now = new Date();

    let elementStack = [];
    for(let [k,v] of pointMap) {
      let offset = v.active ? 86400000 : 0;
      let hoverFunction = this.onHoverElement.bind(null, k);
      let displayMode = constant.DISPLAY_NONE;
      if(this.state.hoverElement == null) {
        if(v.active) {
          displayMode = constant.DISPLAY_ACTIVE;
        }else {
          displayMode = constant.DISPLAY_INACTIVE;
        }
      }else if(this.state.hoverElement !== k) {
        displayMode = constant.DISPLAY_INACTIVE;
      }else {
        if(v.active) {
          displayMode = constant.DISPLAY_ACTIVE;
        }else {
          displayMode = constant.DISPLAY_INACTIVE_HOVER;
        }
        offset = 86400000;
      }

      if(displayMode === constant.DISPLAY_ACTIVE) console.log(`Active path: ${k}`);

      let longestPathStrokeColor;
      switch(displayMode) {
        case constant.DISPLAY_ACTIVE:
          longestPathStrokeColor = constant.COLOR_ACTIVE_SCHEMA[v.colorSchema].COLOR_MORE_40;
          break;
        case constant.DISPLAY_INACTIVE:
          longestPathStrokeColor = constant.COLOR_INACTIVE;
          break;
        case constant.DISPLAY_INACTIVE_HOVER:
          longestPathStrokeColor = constant.COLOR_INACTIVE_HOVER;
          break;
        default:
          longestPathStrokeColor = 'black';
      }
      elementStack.push({
        priority: v.points.length === 0 ? 0 : v.points[0].time + offset,
        element: <Line stroke={longestPathStrokeColor}
          strokeWidth={constant.PATH_STROKE_WIDTH}
          // lineJoin="round"
          // lineCap="round"
          tension={0.5}
          points={v.points.reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
          onMouseEnter={hoverFunction}
          onMouseLeave={this.onLeaveElement}
          key={k+"l1"}
        />
      });

      
      let lessThan40Points = v.points.filter(p => (now - p.time) <= 40 * 1000);
      if(displayMode === constant.DISPLAY_ACTIVE) {
        elementStack.push({
          priority: lessThan40Points.length === 0 ? 0 : lessThan40Points[0].time + offset + 1,
          element: <Line stroke={constant.COLOR_ACTIVE_SCHEMA[v.colorSchema].COLOR_LESS_40}
            strokeWidth={constant.PATH_STROKE_WIDTH}
            lineJoin="round"
            lineCap="round"
            tension={0.5}
            points={lessThan40Points.reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
            onMouseEnter={hoverFunction}
            onMouseLeave={this.onLeaveElement}
            key={k+"l2"}
          />
        });
      }

      let lessThan20Points = lessThan40Points.filter(p => (now - p.time) <= 20 * 1000);
      if(displayMode === constant.DISPLAY_ACTIVE) {
        elementStack.push({
          priority: lessThan20Points.length === 0 ? 0 : lessThan20Points[0].time + offset + 2,
          element: <Line stroke={constant.COLOR_ACTIVE_SCHEMA[v.colorSchema].COLOR_LESS_20}
            strokeWidth={constant.PATH_STROKE_WIDTH}
            lineJoin="round"
            lineCap="round"
            tension={0.5}
            points={lessThan20Points.reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
            onMouseEnter={hoverFunction}
            onMouseLeave={this.onLeaveElement}
            key={k+"l3"}
          />
        });
      }

      if(v.points.length !== 0 && displayMode === constant.DISPLAY_ACTIVE) {
        elementStack.push({
          priority: v.points[0].time + offset + 4,
          element: <Dot x={v.points[0].x}
            y={v.points[0].y}
            color='white'
            labelColor='rgb(79,78,151)'
            label={'START'}
            white={true}
            onMouseEnter={hoverFunction}
            onMouseLeave={this.onLeaveElement}
            key={k+"d1"}
          />
        });

        for(let i=0;i<lessThan20Points.length;i++) {
          let point = lessThan20Points[i];
          if(point.time === v.points[0].time) continue;
          let isSpanDot = new Date(point.time).getSeconds() % constant.DOT_SPAN === 0;
          
          elementStack.push({
            priority: point.time + offset + 5,
            element: <Dot x={point.x}
              y={point.y}
              color={i === lessThan20Points.length - 1 ? 'rgb(251,225,98)' : (isSpanDot ? 'white' : constant.COLOR_ACTIVE_SCHEMA[v.colorSchema].COLOR_LESS_20)}
              label={isSpanDot ? util.convertTime(point.time) : null}
              labelColor={constant.COLOR_ACTIVE_SCHEMA[v.colorSchema].COLOR_TIME_LABEL} 
              onMouseEnter={hoverFunction}
              onMouseLeave={this.onLeaveElement}
              key={k+"d2"+point.uuid}
            />
          });
        }
        let nowPoint = lessThan20Points[lessThan20Points.length - 1];
        elementStack.push({
          priority: nowPoint.time + offset + 4,
          element: <Group key={k+'glowgroup'}>
                    <Arc x={nowPoint.x}
                      y={nowPoint.y} 
                      innerRadius={constant.DOT_RADIUS}
                      outerRadius={constant.DOT_RADIUS*3}
                      angle={360}
                      fill='rgb(134,70,13)'
                      opacity={0.7}
                    />
                    <Arc x={nowPoint.x}
                      y={nowPoint.y} 
                      innerRadius={constant.DOT_RADIUS*3}
                      outerRadius={constant.DOT_RADIUS*5}
                      angle={360}
                      fill='rgb(82,49,20)'
                      opacity={0.5}
                    />
                    <Arc x={nowPoint.x}
                      y={nowPoint.y} 
                      innerRadius={constant.DOT_RADIUS*5}
                      outerRadius={constant.DOT_RADIUS*7}
                      angle={360}
                      fill='rgb(39,32,26)'
                      opacity={0.3}
                    />
                    </Group>
        })
      }
    }
    elementStack.sort((a,b) => a.priority - b.priority);
    console.log(`\nNumber of elements to render: ${elementStack.length}, paths: ${pointMap.size}`)
    return (
      <Layer>
      {elementStack.map(e=>e.element)}
      </Layer>
    );
  }
}

export default Dashboard;

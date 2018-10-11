import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Group, Circle, Line, Rect, Arc } from 'react-konva';
import Konva from 'konva';
import BackgroundImage from './asset/bg.jpg';
import Dot from './Dot';
import TimeSelector from './TimeSelector';
import constant from './constant';
import util from './util';

// TODO:
// 0.2s to draw the trace
// shadow of real-time track
// split the line less than 40 seconds
class App extends Component {
  state = {
    scopeMinX: null,
    scopeMinY: null,
    scopeMaxX: null,
    scopeMaxY: null,
    data: new Map(),
    background: BackgroundImage,
    hoverElement: null,
    timeLimit: null,
  }

  cache = {
    activeColorMap: new Map()
  }

  config = {
    hoverOutDelayTimeout: null,
  }

  refresh = () => {
    fetch('/api/fake').then(results => results.json()).then(data => {
      let pointMap = new Map();
      let now = new Date();
      let pointArray = data.values;
      if(this.state.timeLimit != null) {
        pointArray = pointArray.filter(p => now - p.time < this.state.timeLimit * 60 * 1000);
      } 
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
        for(let point of v.points) {
          if(now - point.time < constant.ACTIVE_TIME_SPAN * 1000) {
            active = true;
            break;
          }
        }
        v.active = active;
      }
      this.setState({
        scopeMinX: data.scope.minX,
        scopeMinY: data.scope.minY,
        scopeMaxX: data.scope.maxX,
        scopeMaxY: data.scope.maxY,
        data: pointMap,
      })
    }).catch(e => {
      console.error(e);
    });
  }

  getX(x) {
    return window.innerWidth * (x - this.state.scopeMinX) / (this.state.scopeMaxX - this.state.scopeMinX);
  }

  getY(y) {
    return window.innerHeight * (y - this.state.scopeMinY) / (this.state.scopeMaxY - this.state.scopeMinY);
  }

  componentDidMount() {
    setInterval(this.refresh, 500);
    this.fetchBackgroundImage();
  }

  getApiDomain() {
    // if(config.apiDomain) {
    //   return config.apiDomain;
    // }
    let domain = "https://" + window.location.hostname;
    return process.env.NODE_ENV === 'development' ? '' : domain;
  }

  // getColor(time) {
  //   let timeSpan = (Date.now() - time) / 1000;
  //   if(timeSpan <= 20) return constant.COLOR_LESS_20;
  //   if(timeSpan <= 40) return constant.COLOR_LESS_40;
  //   return constant.COLOR_MORE_40;
  // }

  getRandomPositionForLabel = (x, y, width, height, deltaX, deltaY) => {
    let x1, x2, y1, y2;
    // Check up
    x1 = x - width / 2;
    x2 = x + width / 2;
    y1 = y - deltaY - height;
    y2 = y - deltaY;
    if (this.checkAreaEmpty(x1, x2, y1, y2)) return {
      x1,
      y1
    };

    // Check right
    x1 = x + deltaX;
    x2 = x + deltaX + width;
    y1 = y - height / 2;
    y2 = y + height / 2;
    if (this.checkAreaEmpty(x1, x2, y1, y2)) return {
      x1,
      y1
    };

    // Check bottom
    x1 = x - width / 2;
    x2 = x + width / 2;
    y1 = y + deltaY;
    y2 = y + deltaY + height;
    if (this.checkAreaEmpty(x1, x2, y1, y2)) return {
      x1,
      y1
    };

    // Check left
    x1 = x - deltaX - width;
    x2 = x - deltaX;
    y1 = y - height / 2;
    y2 = y + height / 2;
    if (this.checkAreaEmpty(x1, x2, y1, y2)) return {
      x1,
      y1
    };

    return {
      x1: x - width / 2,
      y1: y - deltaY - height
    }
  }

  checkAreaEmpty = (x1,x2,y1,y2) => {
    for (let x = x1; x < x2; x += 5) {
      for (let y = y1; y < y2; y += 5) {
        if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return false;
        let node = this.stageRef.getIntersection({
          x,
          y
        });
        // Here may cause bug. When overlapping with other text element it won't avoid
        if (node != undefined && node.className !== 'Text') {
          console.log(this.stageRef.getIntersection({
            x,
            y
          }))
          return false;
        }
      }
    }
    return true;
  }

  handleUpload = (ev) => {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch('/api/backend/background', {
      method: 'POST',
      body: data,
    })
      .then(res => {
        if(res.ok) {
          this.fetchBackgroundImage(true);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  fetchBackgroundImage = (hardRefresh) => {
    fetch('/api/backend/background')
      .then(res => {
        if(res.ok) {
          if(hardRefresh) {
            this.setState({
              background: ''
            },() => {
              this.setState({
                background: '/api/backend/background'
              });
            });
          }else {
            this.setState({
              background: '/api/backend/background'
            });
          }
          
        }
      })
  }

  onHoverElement = (id) => {
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
    },100);
  }

  render() {
    let stageStyle = {
      backgroundImage: `url(${this.state.background})`,
      backgroundRepeat: `no-repeat`,
      backgroundSize: `cover`,
      // opacity: 0.9,
    }

    // Set colors
    let colorUsedTimes = constant.COLOR_ACTIVE_SCHEMA.map(x=>0);
    let cMap = this.cache.activeColorMap;
    for(let [k,v] of this.state.data) {
      if(cMap.has(k)) {
        colorUsedTimes[cMap.get(k)]++;
        v.colorSchema = cMap.get(k);
      }
    }
    for(let [k,v] of this.state.data) {
      if(!cMap.has(k)) {
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

    let elementStack = [];
    for(let [k,v] of this.state.data) {
      let offset = v.active ? 86400000 : 0;
      let hoverFunction = this.onHoverElement.bind(null, k);
      let displayMode = constant.DISPLAY_NONE;
      if(this.state.hoverElement != null && this.state.hoverElement !== k) {
        displayMode = constant.DISPLAY_INACTIVE;
      }else {
        if(v.active) {
          displayMode = constant.DISPLAY_ACTIVE;
        }else {
          displayMode = constant.DISPLAY_INACTIVE_HOVER;
        }
      }

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
          lineJoin="round"
          lineCap="round"
          tension={0.5}
          points={v.points.reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
          onMouseEnter={hoverFunction}
          onMouseLeave={this.onLeaveElement}
          key={k+"l1"}
        />
      });

      let lessThan40Points = v.points.filter(p => (Date.now() - p.time) <= 40 * 1000);
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

      let lessThan20Points = lessThan40Points.filter(p => (Date.now() - p.time) <= 20 * 1000);
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

      if(v.points.length === 0) alert(2)
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
      }

      if(displayMode === constant.DISPLAY_ACTIVE) {
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
              key={k+"d2"+point.time}
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
    return (
      <div>
        <form className="hidden-form" onChange={this.handleUpload} action="/api/backend/background" method="post" encType="multipart/form-data">
          <input ref={r=> {this.uploadInput = r}} type="file" name="background" />
        </form>
      <Stage ref={r => {if(r!=null) this.stageRef = r.getStage()}} style={stageStyle} width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect width={20} height={20} x={0} y={0} onClick={() => {this.uploadInput.click()}}/>
      </Layer>
      <Layer>
      {
        elementStack.map(e=>e.element)
      }
      </Layer>
      <Layer>
        <TimeSelector
          x={window.innerWidth / 2}
          y={window.innerHeight - 40}
          timeChangedCallback={(x) => {
            this.setState({
              timeLimit: x === constant.LIMIT_INF ? null : x
            });
          }}
        />
      </Layer>
      </Stage>
      </div>
    );
  }
}

export default App;

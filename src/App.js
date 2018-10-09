import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Group, Circle, Line, Label, Text } from 'react-konva';
import Konva from 'konva';
import BackgroundImage from './asset/bg.jpg';
import Dot from './Dot';
import constant from './constant';

class App extends Component {
  state = {
    scopeMinX: null,
    scopeMinY: null,
    scopeMaxX: null,
    scopeMaxY: null,
    data: {},
  }
  labelCache = {
    
  }
  refresh = () => {
    fetch('/api/fake').then(results => results.json()).then(data => {
      this.setState({
        scopeMinX: data.scope.minX,
        scopeMinY: data.scope.minY,
        scopeMaxX: data.scope.maxX,
        scopeMaxY: data.scope.maxY,
        data: data.values,
      })
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
  }
  getApiDomain() {
    // if(config.apiDomain) {
    //   return config.apiDomain;
    // }
    let domain = "https://" + window.location.hostname;
    return process.env.NODE_ENV === 'development' ? '' : domain;
  }
  getColor(time) {
    let timeSpan = (Date.now() - time) / 1000;
    if(timeSpan <= 20) return constant.COLOR_LESS_20;
    if(timeSpan <= 40) return constant.COLOR_LESS_40;
    if(timeSpan <= 60) return constant.COLOR_LESS_60;
    return constant.COLOR_MORE_60;
  }
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
  render() {
    let stageStyle = {
      backgroundImage: `url(${BackgroundImage})`,
      backgroundRepeat: `no-repeat`,
      backgroundSize: `cover`,
      opacity: 0.9,
    }
    return (
      <Stage ref={r => {if(r!=null) this.stageRef = r.getStage()}} style={stageStyle} width={window.innerWidth} height={window.innerHeight}>
      {
        Object.entries(this.state.data).map(([k,v]) => 
        [
          <Layer zIndex={2} key={k+v.time}>
            <Line stroke={constant.COLOR_MORE_60}
              strokeWidth={constant.PATH_STROKE_WIDTH}
              lineJoin="round"
              lineCap="round"
              tension={0.5}
              // bezier={true}
              points={v.points.reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
            />
            <Line stroke={constant.COLOR_LESS_60}
              strokeWidth={constant.PATH_STROKE_WIDTH}
              lineJoin="round"
              lineCap="round"
              tension={0.5}
              // bezier={true}
              points={v.points.filter(p => (Date.now() - p.time) <= 60 * 1000).reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
            />
            <Line stroke={constant.COLOR_LESS_40}
              strokeWidth={constant.PATH_STROKE_WIDTH}
              lineJoin="round"
              lineCap="round"
              tension={0.5}
              // bezier={true}
              points={v.points.filter(p => (Date.now() - p.time) <= 40 * 1000).reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
            />
            <Line stroke={constant.COLOR_LESS_20}
              strokeWidth={constant.PATH_STROKE_WIDTH}
              lineJoin="round"
              lineCap="round"
              tension={0.5}
              // bezier={true}
              points={v.points.filter(p => (Date.now() - p.time) <= constant.DOT_DISAPPEAR_SECOND * 1000).reduce((acc,cur)=>{acc.push(cur.x,cur.y);return acc;}, [])}
            />
            {
              (() => {
                if(v.points.length === 0) return null;
                let {x1,y1} = this.getRandomPositionForLabel(v.points[0].x, v.points[0].y, 69, 28, constant.DOT_RADIUS*2.4, constant.DOT_RADIUS*2.4);
                return <Group>
                  <Circle
                  x={v.points[0].x}
                  y={v.points[0].y}
                  radius={constant.DOT_RADIUS*1.2}
                  fill={this.getColor(v.points[0].time)}
                  />
                  <Label x={x1 - constant.DOT_RADIUS*0.6} y={y1 - constant.DOT_RADIUS*0.6} >
                    <Text text='START'
                      fontFamily='Calibri'
                      fontSize={28}
                      padding={5}
                      fill='white' />    
                  </Label>
                </Group>
              })()
              
            }
          </Layer>,
          <Layer zIndex={3} key={k}>
          {
            v.points.filter((p,i) => i !== 0 && i !== v.points.length-1 && i % 5 !== 4 && (Date.now() - p.time) <= constant.DOT_DISAPPEAR_SECOND * 1000).map(p => <Dot x={p.x} y={p.y} />)
          }
          {
            (() => {
              if(v.points.length === 0) return null;
              let nowPoint = v.points[v.points.length - 1];
              let {x1,y1} = this.getRandomPositionForLabel(nowPoint.x, nowPoint.y, 61, 28, constant.DOT_RADIUS*3.0, constant.DOT_RADIUS*3.0);
              return <Group>
                <Dot
                x={nowPoint.x}
                y={nowPoint.y}
                now={true}
                />
                <Label x={x1 - constant.DOT_RADIUS*0.6} y={y1 - constant.DOT_RADIUS*0.6} >
                  <Text ref={r=>{window.mj=r}}text='NOW'
                    fontFamily='Calibri'
                    fontSize={28}
                    padding={5}
                    fill='white' />    
                </Label>
              </Group>
            })()
          }
          </Layer>
        ])
      }
      </Stage>
    );
  }
}

export default App;

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Group, Circle, Line, Rect, Arc } from 'react-konva';
import Konva from 'konva';
import BackgroundImage from './asset/bg.jpg';
import constant from './constant';
import util from './util';
import Dashboard from './Dashboard';
import Heatmap from './Heatmap';
import TimeSelector from './TimeSelector';

// TODO:
// 0.2s to draw the trace
// shadow of real-time track
// split the line less than 40 seconds
// time selector hide in default
class App extends Component {
  state = {
    background: BackgroundImage,
    timeLimit: null,
    data: new Map(),
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

  getX(x, max) {
    return x / max * window.innerWidth;
  }

  getY(y, max) {
    return y / max * window.innerHeight;
  }

  refresh = () => {
    fetch('/api/fake').then(results => results.json()).then(data => {
      
      let now = new Date();
      let pointArray = data.values;
      if(this.state.timeLimit != null) {
        pointArray = pointArray.filter(p => now - p.time < this.state.timeLimit * 60 * 1000);
      }
      // Convert cordinate
      pointArray = pointArray.map(point => {
        point.x = this.getX(point.x, data.scope.maxX);
        point.y = this.getY(point.y, data.scope.maxY);
        return point;
      }) 

      this.setState({
        data: pointArray,
      })
    }).catch(e => {
      console.error(e);
    });
  }

  componentDidMount() {
    this.fetchBackgroundImage();
    setInterval(this.refresh, 500);
    
  }

  render() {
    let backgroundStyle = {
      backgroundImage: `url(${this.state.background})`,
      backgroundRepeat: `no-repeat`,
      backgroundSize: `cover`,
    }
    let stageStyle = {
      position: 'fixed'
      // opacity: 0.9,
    }
    return (<div className='app' id='app' style={backgroundStyle}>
      <form className="hidden-form" onChange={this.handleUpload} action="/api/backend/background" method="post" encType="multipart/form-data">
          <input ref={r=> {this.uploadInput = r}} type="file" name="background" />
        </form>
      {
        this.props.children.type === Heatmap && 
        React.Children.map(this.props.children, child => React.cloneElement(child, { 
          data: this.state.data,
        }))
      }
      <Stage ref={r => {if(r!=null) this.stageRef = r.getStage();}} style={stageStyle} width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect width={20} height={20} x={0} y={0} onClick={() => {this.uploadInput.click()}}/>
        </Layer>
        {this.props.children.type === Dashboard && React.Children.map(this.props.children, child => React.cloneElement(child, { 
          data: this.state.data,
        }))}
                
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
    </div>)
    
  }
}

export default App;

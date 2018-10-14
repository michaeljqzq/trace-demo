import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Group, Circle, Line, Rect, Arc, Path } from 'react-konva';
import Konva from 'konva';
import BackgroundImage from './asset/bg.jpg';
import constant from './constant';
import util from './util';
import Dashboard from './Dashboard';
import Heatmap from './Heatmap';
import TimeSelector from './TimeSelector';
import RouterSelector from './RouterSelector';
import { withRouter } from 'react-router-dom';
import GeneralSelector from './GeneralSelector';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

// TODO:

// today:
// time range configure item
// fix bug: switch route be blocked

// 0.2s to draw the trace
// shadow of real-time track
// split the line less than 40 seconds
// time selector hide in default
class App extends Component {
  state = {
    background: BackgroundImage,
    timeLimit: null,
    data: new Map(),
    showSettings: false,
    startDate: moment().hour(0).minute(0),
    logFactor: 10,
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
    fetch(`/api/fake?start=${this.state.startDate.valueOf()}&end=${this.state.startDate.clone().hour(23).minute(59).second(59).valueOf()}`).then(results => results.json()).then(data => {
      
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
    console.log('App component mounted');
    this.fetchBackgroundImage();
    setInterval(this.refresh, 1000 * constant.WEB_REFRESH_INTERVAL);
  }

  onMouseOver = () => {
    document.body.style.cursor = "pointer";
  }

  onMouseLeave = () => {
    document.body.style.cursor = "default";
  }

  onClick = () => {
    this.setState((prev) => ({
      showSettings: !prev.showSettings
    }));
  }

  handleChange = (date) => {
    if(date > moment()) {
      alert('selected date is later than now');
      return;
    }
    this.setState({
      startDate: date
    });
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
    let datePickerStyle = {
      position: 'fixed',
      left: window.innerWidth - 450,
      top: window.innerHeight - 52,
      zIndex: 11,
    }
    let isRouteHeatmap = false;
    if(this.props.location.pathname.includes(constant.ROUTER_PATH_HEATMAP)) isRouteHeatmap = true;
    return (<div className='app' id='app' style={backgroundStyle}>
      <form className="hidden-form" onChange={this.handleUpload} action="/api/backend/background" method="post" encType="multipart/form-data">
          <input ref={r=> {this.uploadInput = r}} type="file" name="background" />
        </form>
        {
          this.state.showSettings && <div className="date-picker" style={datePickerStyle} >
          <DatePicker
              selected={this.state.startDate}
              onChange={this.handleChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="LLL"
              timeCaption="time"
          /></div>
        }
      
      <Stage ref={r => {if(r!=null) this.stageRef = r.getStage();}} style={stageStyle} width={window.innerWidth} height={window.innerHeight}>
      {
        isRouteHeatmap && 
        <Heatmap data={this.state.data} logFactor={this.state.logFactor}/>
      }
        <Layer>
          <Rect width={20} height={20} x={0} y={0} onClick={() => {this.uploadInput.click()}}/>
        
          <RouterSelector
            x={window.innerWidth / 2 - constant.ROUTER_SELECTOR_WIDTH}
            selected={!isRouteHeatmap}
            text='TRACE'
            path={constant.ROUTER_PATH_TRACE}
            onClick={() => {this.uploadInput.click()}}
          />
          <RouterSelector
            x={window.innerWidth / 2}
            selected={isRouteHeatmap}
            text='HEATMAP'
            path={constant.ROUTER_PATH_HEATMAP}
            onClick={() => {this.uploadInput.click()}}
          />
        </Layer>
        {
          !isRouteHeatmap && 
          <Dashboard data={this.state.data} />
        }
                
        <Layer>
          {/* <TimeSelector
            x={window.innerWidth / 2}
            y={window.innerHeight - 40}
            timeChangedCallback={(x) => {
              this.setState({
                timeLimit: x === constant.LIMIT_INF ? null : x
              });
            }}
          /> */}
          <Path 
              x={window.innerWidth - 50}
              y={window.innerHeight - 50}
              fill={constant.COLOR_SETTINGS}
              scale={{
                x: 1.5,
                y: 1.5
              }}
              data='M10.032,8.367c-1.112,0-2.016,0.905-2.016,2.018c0,1.111,0.904,2.014,2.016,2.014c1.111,0,2.014-0.902,2.014-2.014C12.046,9.271,11.143,8.367,10.032,8.367z M10.032,11.336c-0.525,0-0.953-0.427-0.953-0.951c0-0.526,0.427-0.955,0.953-0.955c0.524,0,0.951,0.429,0.951,0.955C10.982,10.909,10.556,11.336,10.032,11.336z,M17.279,8.257h-0.785c-0.107-0.322-0.237-0.635-0.391-0.938l0.555-0.556c0.208-0.208,0.208-0.544,0-0.751l-2.254-2.257c-0.199-0.2-0.552-0.2-0.752,0l-0.556,0.557c-0.304-0.153-0.617-0.284-0.939-0.392V3.135c0-0.294-0.236-0.532-0.531-0.532H8.435c-0.293,0-0.531,0.237-0.531,0.532v0.784C7.582,4.027,7.269,4.158,6.966,4.311L6.409,3.754c-0.1-0.1-0.234-0.155-0.376-0.155c-0.141,0-0.275,0.055-0.375,0.155L3.403,6.011c-0.208,0.207-0.208,0.543,0,0.751l0.556,0.556C3.804,7.622,3.673,7.935,3.567,8.257H2.782c-0.294,0-0.531,0.238-0.531,0.531v3.19c0,0.295,0.237,0.531,0.531,0.531h0.787c0.105,0.318,0.236,0.631,0.391,0.938l-0.556,0.559c-0.208,0.207-0.208,0.545,0,0.752l2.254,2.254c0.208,0.207,0.544,0.207,0.751,0l0.558-0.559c0.303,0.154,0.616,0.285,0.938,0.391v0.787c0,0.293,0.238,0.531,0.531,0.531h3.191c0.295,0,0.531-0.238,0.531-0.531v-0.787c0.322-0.105,0.636-0.236,0.938-0.391l0.56,0.559c0.208,0.205,0.546,0.207,0.752,0l2.252-2.254c0.208-0.207,0.208-0.545,0.002-0.752l-0.559-0.559c0.153-0.303,0.285-0.615,0.389-0.938h0.789c0.295,0,0.532-0.236,0.532-0.531v-3.19C17.812,8.495,17.574,8.257,17.279,8.257z M16.747,11.447h-0.653c-0.241,0-0.453,0.164-0.514,0.398c-0.129,0.496-0.329,0.977-0.594,1.426c-0.121,0.209-0.089,0.473,0.083,0.645l0.463,0.465l-1.502,1.504l-0.465-0.463c-0.174-0.174-0.438-0.207-0.646-0.082c-0.447,0.262-0.927,0.463-1.427,0.594c-0.234,0.061-0.397,0.271-0.397,0.514V17.1H8.967v-0.652c0-0.242-0.164-0.453-0.397-0.514c-0.5-0.131-0.98-0.332-1.428-0.594c-0.207-0.123-0.472-0.09-0.646,0.082l-0.463,0.463L4.53,14.381l0.461-0.463c0.169-0.172,0.204-0.434,0.083-0.643c-0.266-0.461-0.467-0.939-0.596-1.43c-0.06-0.234-0.272-0.398-0.514-0.398H3.313V9.319h0.652c0.241,0,0.454-0.162,0.514-0.397c0.131-0.498,0.33-0.979,0.595-1.43c0.122-0.208,0.088-0.473-0.083-0.645L4.53,6.386l1.503-1.504l0.46,0.462c0.173,0.172,0.437,0.204,0.646,0.083c0.45-0.265,0.931-0.464,1.433-0.597c0.233-0.062,0.396-0.274,0.396-0.514V3.667h2.128v0.649c0,0.24,0.161,0.452,0.396,0.514c0.502,0.133,0.982,0.333,1.433,0.597c0.211,0.12,0.475,0.089,0.646-0.083l0.459-0.462l1.504,1.504l-0.463,0.463c-0.17,0.171-0.202,0.438-0.081,0.646c0.263,0.448,0.463,0.928,0.594,1.427c0.061,0.235,0.272,0.397,0.514,0.397h0.651V11.447z'
            />
          <Rect 
              x={window.innerWidth - 50}
              y={window.innerHeight - 50}
              width={30}
              height={30}
              onClick={this.onClick}
              onMouseOver={this.onMouseOver}
              onMouseLeave={this.onMouseLeave}
            />
            {
              this.state.showSettings && <GeneralSelector 
                x={window.innerWidth - 200}
                y={window.innerHeight - 40}
                min={2}
                max={20}
                current={this.state.logFactor}
                valueChangedCallback={(x) => {
                  this.setState({
                    logFactor: x
                  });
                }}
              />
            }
        </Layer>
        
      </Stage>
          
    </div>)
    
  }
}

export default withRouter(App);

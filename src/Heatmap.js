import React from 'react';
import './App.css';
import { Layer } from 'react-konva';
import constant from './constant';


class Heatmap extends React.Component {
  
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.data !== this.props.data) {
      const SCALE = constant.HEAT_MAP_PIXEL_SCALE;
      let rows = Math.floor((window.innerWidth) / constant.HEAT_MAP_PIXEL_SCALE) + 1;
      let columns = Math.floor((window.innerHeight) / constant.HEAT_MAP_PIXEL_SCALE) + 1;
      let heatMap = new Array(rows);
      for(let i=0;i<rows;i++) {
        heatMap[i] = new Array(columns).fill(0);
      }
      for(let point of nextProps.data) {
        heatMap[Math.floor(point.x / SCALE)][Math.floor(point.y / SCALE)]++;
      }
      this.setState({heatMap}, () => {
        // this.layerRef.cache();
        let points = [];
        for(let x=0;x<heatMap.length;x++) {
          for(let y=0;y<heatMap[x].length;y++) {
            if(heatMap[x][y]) {
              points.push({
                x:x*SCALE,y:y*SCALE,value: this.getColor(heatMap[x][y], constant.HEAT_MAP_LEVEL)
              });
            }
          }
        }
        this.heatmap.setData({
          max: constant.HEAT_MAP_LEVEL,
          data: points//[{x:window.innerWidth - 100, y:window.innerHeight - 100, value:5}]
        });
      });
    }
  }

  componentDidMount() {
    // setTimeout(() => {
    //   this.layerRef.filters([Konva.Filters.Blur]);
    //   this.layerRef.blurRadius(constant.HEAT_MAP_BLUR_RADIUS);
    //   this.layerRef.cache();
    //   this.layerRef.draw();
    // },0);
    // let canvas = document.getElementsByTagName('canvas');
    // console.log(canvas)
    this.heatmap = window.h337.create({
      width: window.innerWidth,
      height: window.innerHeight,
      container: document.getElementById('app'),
      backgroundColor: constant.COLOR_HEATMAP_BACKGROUND,
    });
  }

  componentWillUnmount() {
    let parent = document.getElementById("app");
    parent.style.position = 'absolute';
    let child = document.getElementsByClassName('heatmap-canvas')[0];
    if(parent && child) parent.removeChild(child);
  }

  getColor(heatValue, max) {
    if (heatValue === 0) return null;
    let t = heatValue*constant.HEAT_MAP_MULTIPLY_FACTOR;
    let v;
    if(this.props.logFactor === 10) v = Math.floor(Math.log10(t));
    else v = Math.floor(Math.log(t) / Math.log(this.props.logFactor));
    if (v > max) v = max;
    return v;
  }

  

  render() {
      const SCALE = constant.HEAT_MAP_PIXEL_SCALE;
      return (
          <Layer ref={r=> {this.layerRef=r;}}>
          </Layer>
      );
  }
}

export default Heatmap;
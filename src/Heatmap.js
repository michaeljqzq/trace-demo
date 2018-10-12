import React, { Component } from 'react';
import './App.css';
import { Rect, Group, Image as KonvaImage, Layer } from 'react-konva';
import Konva from 'konva';
import Label from './Label';
import constant from './constant';

class Heatmap extends React.Component {
  state = {
    heatMap: [],
  }
  temp=-1

  constructor(props) {
    super(props);
    this.rows = Math.floor((window.innerWidth - 1) / constant.HEAT_MAP_PIXEL_SCALE) + 1;
    this.columns = Math.floor((window.innerHeight - 1) / constant.HEAT_MAP_PIXEL_SCALE) + 1;
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.data !== this.props.data) {
      const SCALE = constant.HEAT_MAP_PIXEL_SCALE;
      let heatMap = new Array(this.rows);
      for(let i=0;i<this.rows;i++) {
        heatMap[i] = new Array(this.columns).fill(0);
      }
      for(let point of nextProps.data) {
        heatMap[Math.floor(point.x / SCALE)][Math.floor(point.y / SCALE)]++;
      }
      this.setState({heatMap}, () => {
        this.layerRef.cache();
      });
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.layerRef.filters([Konva.Filters.Blur]);
      this.layerRef.blurRadius(constant.HEAT_MAP_BLUR_RADIUS);
      this.layerRef.cache();
      this.layerRef.draw();
    },0);
  }

  getColor(heatValue) {
    if (heatValue === 0) return null;
    let v = Math.floor(Math.log10(heatValue*constant.HEAT_MAP_MULTIPLY_FACTOR))+3;
    if (v > constant.COLOR_HEAT.length - 1) v = constant.COLOR_HEAT.length - 1;
    return constant.COLOR_HEAT[v];
    // this.temp = (this.temp+1)%constant.COLOR_HEAT.length;
    // return constant.COLOR_HEAT[this.temp];
  }

  render() {
      const SCALE = constant.HEAT_MAP_PIXEL_SCALE;
      return (
          <Layer ref={r=> {this.layerRef=r;}}>
            {
              this.state.heatMap.map((line,x) => <Group key={x}>
                {
                  line.map((p,y) => <Rect 
                    x={x*SCALE}
                    y={y*SCALE}
                    width={SCALE}
                    height={SCALE}
                    fill={this.getColor(p)}
                    key={y}
                    cornerRadius={SCALE}
                  />)
                }
              </Group>)
            }
          </Layer>
      );
  }
}

export default Heatmap;
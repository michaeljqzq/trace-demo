import React, { Component } from 'react';
import './App.css';
import { Circle } from 'react-konva';
import Konva from 'konva';
import constant from './constant';

class Dot extends React.Component {
  render() {
    return (
      <Circle
        x={this.props.x}
        y={this.props.y}
        radius={constant.DOT_RADIUS * (this.props.now ? 1.5 : 1)}
        fill={constant.COLOR_DOT_CORE}
        stroke={constant.COLOR_LESS_20}
        strokeWidth={constant.DOT_STROKE_WIDTH * (this.props.now ? 1.5 : 1)}
      />
    );
  }
}

export default Dot;
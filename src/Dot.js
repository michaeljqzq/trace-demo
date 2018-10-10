import React, { Component } from 'react';
import './App.css';
import { Circle, Group } from 'react-konva';
import Konva from 'konva';
import Label from './Label';
import constant from './constant';

class Dot extends React.Component {
  render() {
    return (
      <Group>
        <Circle
          x={this.props.x}
          y={this.props.y}
          radius={constant.DOT_RADIUS}
          fill={constant.COLOR_DOT_CORE}
          stroke={this.props.head ? 'rgb(251,225,98)' : (this.props.white ? 'white' : constant.COLOR_LESS_20)}
          strokeWidth={constant.DOT_STROKE_WIDTH}
        />
        {
          this.props.label && <Label x={this.props.x} y={this.props.y - constant.DOT_RADIUS} labelColor={this.props.labelColor} labelText={this.props.label} />
        }
      </Group>
    );
  }
}

export default Dot;
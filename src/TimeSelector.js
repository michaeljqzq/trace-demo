import React, { Component } from 'react';
import './App.css';
import { Circle, Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import Label from './Label';
import constant from './constant';

const TOTAL_LENGTH = 100;
const RECT_HEIGHT = 5;
const BAR_HEIGHT = 30;
const BAR_WIDTH = 10;
const COLOR = '#555';

const LIMIT_MIN = 1;

class TimeSelector extends React.Component {
  state = {
    x: null,
    limit: constant.LIMIT_INF
  }

  onMouseOver = () => {
    document.body.style.cursor = "pointer";
  }

  onMouseLeave = () => {
    document.body.style.cursor = "default";
  }

  componentDidMount() {
    this.setState({
      x: this.props.x - TOTAL_LENGTH / 2 - BAR_WIDTH / 2
    });
  }

  render() {
    return (
      <Group>
        <Rect 
          x={this.props.x - TOTAL_LENGTH / 2}
          y={this.props.y - RECT_HEIGHT / 2}
          width={TOTAL_LENGTH}
          height={RECT_HEIGHT}
          fill={COLOR}
          cornerRadius={RECT_HEIGHT}
        />
        <Rect 
          x={this.state.x}
          y={this.props.y - BAR_HEIGHT / 2}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          fill={COLOR}
          cornerRadius={RECT_HEIGHT}
          draggable={true}
          dragBoundFunc={pos => {
            let leftBound = this.props.x - TOTAL_LENGTH / 2 - BAR_WIDTH / 2;
            let rightBound = this.props.x + TOTAL_LENGTH / 2 - BAR_WIDTH / 2;
            let posx = pos.x;
            if(posx < leftBound) posx = leftBound;
            if(posx > rightBound) posx = rightBound;
            let limit = Math.round((posx - leftBound) * (LIMIT_MIN - constant.LIMIT_INF) / (rightBound - leftBound) + constant.LIMIT_INF);
            this.setState({
              x:posx,
              limit
            });
            return {
              x: posx,
              y: this.props.y - BAR_HEIGHT / 2
            }
          }}
          onDragEnd={() => {
            if(this.props.timeChangedCallback) {
              this.props.timeChangedCallback(this.state.limit);
            }
          }}
          onMouseOver={this.onMouseOver}
          onMouseLeave={this.onMouseLeave}
        />
        <Text 
          x={this.props.x + TOTAL_LENGTH / 2 - BAR_WIDTH / 2 + 20} 
          y={this.props.y - RECT_HEIGHT / 2 - 3} 
          text={this.state.limit === constant.LIMIT_INF ? "Not limited" : `${this.state.limit} mins`}
          fontFamily='Segoe UI'
          fontSize={10}
          fill={COLOR}
          align='center' 
          />
      </Group>
    );
  }
}

export default TimeSelector;
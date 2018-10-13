import React, { Component } from 'react';
import './App.css';
import { Circle, Group, Rect, Text, Layer } from 'react-konva';
import Konva from 'konva';
import Label from './Label';
import constant from './constant';
import { withRouter } from 'react-router-dom';

class RouterSelector extends React.Component {
  onMouseOver = () => {
    document.body.style.cursor = "pointer";
  }

  onMouseLeave = () => {
    document.body.style.cursor = "default";
  }

  onClick = (path) => {
    this.props.history.push(path);
  }

  render() {
    return (
      <Group>
          <Rect
            width={constant.ROUTER_SELECTOR_WIDTH}
            height={constant.ROUTER_SELECTOR_HEIGHT}
            x={this.props.x}
            y={constant.ROUTER_SELECTOR_HEIGHT * 1.5}
            fill={this.props.selected ? 'white' : 'black'}
            stroke="white"
            onClick={this.onClick.bind(null, this.props.path)}
            onMouseOver={this.onMouseOver}
            onMouseLeave={this.onMouseLeave} 
          />
          <Text 
            x={this.props.x} 
            y={constant.ROUTER_SELECTOR_HEIGHT * 1.5} 
            text={this.props.text}
            width={constant.ROUTER_SELECTOR_WIDTH}
            height={constant.ROUTER_SELECTOR_HEIGHT}
            fontFamily='Helvetica Neue'
            fontSize={15}
            fill={this.props.selected ? 'black' : 'white'}
            align='center' 
            verticalAlign='middle' 
            onClick={this.onClick.bind(null, this.props.path)}
            onMouseOver={this.onMouseOver}
            onMouseLeave={this.onMouseLeave} 
          />
      </Group>
    );
  }
}

export default withRouter(RouterSelector);
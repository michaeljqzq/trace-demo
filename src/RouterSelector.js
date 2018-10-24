import React from 'react';
import './App.css';
import { Group, Rect, Text } from 'react-konva';
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
            fill={this.props.selected ? 'white' : ''}
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
            fontFamily={constant.FONT_FAMILY}
            fontStyle={constant.FONT_STYLE}
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
import React, { Component } from 'react';
import './App.css';
import { Rect, Text, Group } from 'react-konva';
import Konva from 'konva';
import constant from './constant';

class Label extends React.Component {
  state = {
    rectWidth: 0,
    rectHeight: 0,
    rectX: 0,
    rectY: 0,
  }

  componentDidMount() {
    // do your text calculations here
    this.setState({
      rectWidth: this.textRef.width() + constant.LABEL_TEXT_LR_PADDING * 2,
      rectHeight: this.textRef.height(),
      rectX: this.props.x - this.textRef.width() / 2 - constant.LABEL_TEXT_LR_PADDING,
      rectY: this.props.y - constant.LABEL_PIN_HEIGHT - this.textRef.height()
    });
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.x !== this.props.x || nextProps.y !== this.props.y) {
      this.setState({
        rectX: nextProps.x - this.textRef.width() / 2 - constant.LABEL_TEXT_LR_PADDING,
        rectY: nextProps.y - constant.LABEL_PIN_HEIGHT - this.textRef.height()
      });
    }
  }

  render() {
    return (
      <Group>
        <Rect x={this.state.rectX} y={this.state.rectY} 
          width={this.state.rectWidth} 
          height={this.state.rectHeight} 
          fill={this.props.labelColor}
          cornerRadius={20}
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave} 
          />
        <Text x={this.state.rectX + constant.LABEL_TEXT_LR_PADDING} y={this.state.rectY} ref={ r => {this.textRef = r;}} text={this.props.labelText}
          fontFamily='Segoe UI'
          fontSize={20}
          padding={5}
          fill='white'
          align='center' 
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave} 
          />
        <Rect x={this.props.x - constant.LABEL_PIN_WIDTH / 2} y={this.props.y - constant.LABEL_PIN_HEIGHT} 
          width={constant.LABEL_PIN_WIDTH} 
          height={constant.LABEL_PIN_HEIGHT} 
          fill='white' />
      </Group>
    );
  }
}

export default Label;
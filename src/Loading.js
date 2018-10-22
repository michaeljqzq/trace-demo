import React from 'react';
import './App.css';
import { Arc, Group, Rect } from 'react-konva';
import Label from './Label';
import constant from './constant';

class Dot extends React.Component {
  componentWillReceiveProps(nextProps) {
    if(nextProps.loading !== this.props.loading) {
      if(nextProps.loading === true) {
        this.showLoading();
      }else {
        this.hideLoading();
      }
    }
  }

  componentDidMount() {
    if(this.props.loading === true) {
      this.showLoading();
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.loading !== this.props.loading;
  }

  ElasticEaseInOut = function (t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t + b;
    }
    return -c / 2 * (--t * (t - 2) - 1) + b;
  }

  showLoading = () => {
    if (this.loadingRef) {
      let interval = 1;
      let degree = 0;
      this.loadingRef.rotation(0);
      let f = () => {
        degree += 360;
        this.loadingRef.to({
          rotation: degree,
          duration: interval,
          easing: this.ElasticEaseInOut,
        });
      };
      f();
      this.loadingInterval = window.setInterval(f, interval * 1000);
    }
  }

  hideLoading = () => {
    if (this.loadingInterval) window.clearInterval(this.loadingInterval);
    if(this.loadingRef) {
      this.loadingRef.rotation(0);
    }
  }
  
  render() {
    return (
        <Group>
            <Arc
              ref={input => { this.loadingRef = input; }}
              x={window.innerWidth - 56}
              y={56}
              innerRadius={10}
              outerRadius={15}
              angle={330}
              visible={this.props.loading}
              fill={constant.COLOR_SETTINGS}
            />
        </Group>    
    );
  }
}

export default Dot;
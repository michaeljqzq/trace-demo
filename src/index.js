import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Heatmap from './Heatmap';
import Dashboard from './Dashboard';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

ReactDOM.render(<Router>
  <div>
    <Route exact path="/" render={props => <App><Dashboard /></App>} />
    <Route path="/dashboard" render={props => <App><Dashboard /></App>} />
    <Route path="/heatmap" render={props => <App><Heatmap /></App>} />
  </div>
</Router>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

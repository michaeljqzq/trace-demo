const constant = {
  WEB_REFRESH_INTERVAL: 1,
  COLOR_DOT_CORE: "black",
  COLOR_ACTIVE_SCHEMA: [{
    COLOR_LESS_20: "rgb(66,255,246)",
    COLOR_LESS_40: "rgb(63,152,190)",
    COLOR_MORE_40: "rgb(50,82,119)",
    COLOR_TIME_LABEL: "rgb(7,32,40)",
  },{
    COLOR_LESS_20: "#FF51D9",
    COLOR_LESS_40: "#AB5387",
    COLOR_MORE_40: "#613A51",
    COLOR_TIME_LABEL: "rgb(44,20,34)",
  },{
    COLOR_LESS_20: "#04FF03",
    COLOR_LESS_40: "#51894B",
    COLOR_MORE_40: "#3A5137",
    COLOR_TIME_LABEL: "rgb(11,33,5)",
  }],
  COLOR_INACTIVE: "rgb(29,44,78)",
  COLOR_INACTIVE_HOVER: "#2152C3",
  COLOR_HEATMAP_BACKGROUND: "#030406",
  COLOR_SETTINGS: '#555',
  DOT_RADIUS: 6,
  DOT_STROKE_WIDTH: 4,
  DOT_DISAPPEAR_SECOND: 20,
  DOT_SPAN: 5,
  PATH_STROKE_WIDTH: 6,
  LABEL_PIN_HEIGHT: 15,
  LABEL_PIN_WIDTH: 2,
  LABEL_TEXT_LR_PADDING: 10,
  ACTIVE_TIME_SPAN: 10,
  DISPLAY_NONE: 0,
  DISPLAY_INACTIVE: 1,
  DISPLAY_INACTIVE_HOVER: 2,
  DISPLAY_ACTIVE: 3,
  LIMIT_INF: 61,
  HEAT_MAP_LEVEL: 5,
  HEAT_MAP_PIXEL_SCALE: 20,
  HEAT_MAP_MULTIPLY_FACTOR: 5,
  HEAT_MAP_BLUR_RADIUS: 50,
  ROUTER_SELECTOR_WIDTH: 90,
  ROUTER_SELECTOR_HEIGHT: 28,
  ROUTER_PATH_TRACE: 'trace',
  ROUTER_PATH_HEATMAP: 'heatmap',
  CAMERA_LIMIT_X: 1000,
  CAMERA_LIMIT_Y: 600,
  FONT_FAMILY: 'Helvetica Neue',

  DB_HOST: "https://techsummitdemo.documents.azure.com:443/",
  DB_KEY: "YQxOABk7IleRNoc6jcglAYXoRiCldTVLpfk5GjWz6MrpOGADnO0LQUmZZInAl7gKrmKeokt7HvCVluvN37XAPA==",
  DB_DATABASE_ID: "ToDoList",
  DB_COLLECTION_ID: "Items",
}

module.exports = constant;
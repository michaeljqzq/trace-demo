const constant = {
  WEB_REFRESH_INTERVAL: 0.7,
  COLOR_DOT_CORE: "black",
  COLOR_ACTIVE_SCHEMA: [{
    COLOR_LESS_20: "rgb(66,255,246)",
    COLOR_LESS_40: "rgb(63,152,190)",
    COLOR_MORE_40: "#1E5972",
    COLOR_TIME_LABEL: "rgb(7,32,40)",
  }],
  COLOR_INACTIVE: "#3A4661",
  COLOR_INACTIVE_WHEN_NO_ACTIVE_PATH: "#1E5972",
  COLOR_INACTIVE_HOVER: "#2152C3",
  COLOR_HEATMAP_BACKGROUND: "#030406",
  COLOR_SETTINGS: '#bbb',
  DOT_RADIUS: 11,
  DOT_STROKE_WIDTH: 8,
  DOT_DISAPPEAR_SECOND: 20,
  DOT_SPAN: 5,
  PATH_STROKE_WIDTH: 12,
  PATH_STROKE_WIDTH_INACTIVE: 6,
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
  CAMERA_LIMIT_X: 1920,
  CAMERA_LIMIT_Y: 1080,
  FONT_FAMILY: 'Segoe UI',
  FONT_STYLE: '700',
  USE_FAKE_DATA: false,
}

module.exports = constant;
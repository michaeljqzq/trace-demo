class util {
  static checkTime(i) {
    return (i < 10) ? "0" + i : i;
  }

  static convertTime(time) {
    if(!(time instanceof Date)) {
      time = new Date(time);
    }
    let h = util.checkTime(time.getHours()),
      m = util.checkTime(time.getMinutes()),
      s = util.checkTime(time.getSeconds());
    return h + ":" + m + ":" + s;
  }
}
export default util;
var func = function(x, n) {
  return Math.pow(x, n) / Math.pow(10, n-1);
};

var data = [];

for (n = 1; n <= 10; n++) {
  var line = [];
  for (x = -11; x <= 11; x+=0.1) {
    line.push([x, func(x, n)]);
  }
  data.push(line);
}

options = {
  interpolation: "none",
}

d3linechart("chart", data, options)
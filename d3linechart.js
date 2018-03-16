// Draws a line chart using SVG. Requires d3.js to be read first.
// data = [[[0,0],[0,0],...],[[0,0],[0,0],...],...]
function d3linechart(parentId, data, options) {

  // Set default options
  var interpolation = options.interpolation || "basis";
  
  // Find the minimum and maximum values for the axes
  var xmin = (typeof(options.xmin) !== 'undefined') ? options.xmin : d3.min(data, function(line) {
    return d3.min(line, function(point) { return point[0]; });
  });
  var xmax = (typeof(options.xmax) !== 'undefined') ? options.xmax : d3.max(data, function(line) {
    return d3.max(line, function(point) { return point[0]; });
  });
  var ymin = (typeof(options.ymin) !== 'undefined') ? options.ymin : d3.min(data, function(line) {
    return d3.min(line, function(point) { return point[1]; });
  });
  var ymax = (typeof(options.ymax) !== 'undefined') ? options.ymax : d3.max(data, function(line) {
    return d3.max(line, function(point) { return point[1]; });
  });
  
  // Find parent element
  var parent = document.getElementById(parentId);
  
  // Set width and height
  var fullW = options.width || parent.clientWidth || 960;
  var fullH = options.height || parent.clientHeight || 500;
  
  // Define margins and calculate plot size
  // TODO: Decide margins based on axis values (crops at "1,000,000")
  var margin = {top: 20, right: 20, bottom: 30, left: 60 };
  var width = fullW - margin.left - margin.right;
  var height = fullH - margin.top - margin.bottom;

  // Define axis scales
  var x = d3.scale.linear().domain([xmin, xmax]).range([0, width]);
  var y = d3.scale.linear().domain([ymin, ymax]).range([height, 0]);
  
  // Define axes
  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(6,-height);
  var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(6,-width);

  // Define function for drawing a line
  var line = d3.svg.line()
    .interpolate(interpolation)
    .x(function(d) { return x(d[0]); })
    .y(function(d) { return y(d[1]); });
  
  // Append SVG element to the div and g inside that
  var svg = d3.select('#'+parentId).append("svg")
    .attr("width", fullW)
    .attr("height", fullH)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Append a rect under the plot area
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "svg plot");
  
  // Append the axes
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // Append a clippath so the data gets clipped at the edges
  svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);
  
  // Append a g.field element with a clip-path attribute for each curve
  var field = svg.selectAll(".field")
    .data(data)
    .enter().append("g")
    .attr("clip-path", "url(#clip)")
    .attr("class", "field");
  
  // Append a path element to each field
  field.append("path")
    .attr("class", "line")
    .attr("d", function (d) { return line(d); })
    .style("stroke", d3.scale.category20());
  
  // Set up the zoom function
  var zoomed = function() {
    if (x.domain()[0] < xmin) {
      zoom.translate([zoom.translate()[0] - x(xmin) + x.range()[0], zoom.translate()[1]]);
    } else if (x.domain()[1] > xmax) {
      zoom.translate([zoom.translate()[0] - x(xmax) + x.range()[1], zoom.translate()[1]]);
    }
    if (y.domain()[0] < ymin) {
      zoom.translate([zoom.translate()[0], zoom.translate()[1] - y(ymin) + y.range()[0]]);
    } else if (y.domain()[1] > ymax) {
      zoom.translate([zoom.translate()[0], zoom.translate()[1] - y(ymax) + y.range()[1]]);
    }

    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    svg.selectAll("path.line").attr("d", function(d) {
      return line(d);
    });
  };
  var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
  d3.select("svg").call(zoom);
}
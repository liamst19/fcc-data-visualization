
// Run when the whole page DOM has been loaded from the html file.
document.addEventListener('DOMContentLoaded', ()=> {
  appendBarGraph();
})

// Get the graph data from external source
const getGraphData = async () => {
  const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

  const response = await fetch(dataUrl);

  if(response.ok){
    return await response.json();
  } else{
    console.log('data fetch failed status:', response.status);
    return null;
  }
}

// Append the actual bar graph to page
const appendBarGraph = async () => {

  const dimension = {width: 800, height: 500}
  const margin = {top: 10, bottom: 25, left: 45, right: 20};

  const obj = await getGraphData();
  if(!obj) return;

  // h1 element
  const title = d3.select('body')
        .append('h1')
        .attr('id', 'title')
        .text(obj.name);

  // Tooltip
  const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip');

  const getTooltipPos = (x, y) => {
    return {
      x: x + 5,
      y: y
    }
  }

  // Get the data array from returned object
  const data = obj.data;

  const svgHeight = dimension.height + margin.top + margin.bottom;
  const svgWidth = dimension.width + margin.left + margin.right;

  const barGraphWidth = dimension.width;
  const barGraphHeight = dimension.height;
  const barWidth = barGraphWidth / data.length;
  const barOffsetX = margin.left;
  const barOffsetY = dimension.height + margin.top;

  // Scales ------------------------
  const xScale = d3.scaleUtc()
        .domain(d3.extent(data, d => d[0]).map(d => new Date(d)))
        .range([0, barGraphWidth]);

  const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([0, barGraphHeight]);

  const xAxisScale = d3.scaleUtc()
        .domain(d3.extent(data, d => d[0]).map(d => new Date(d)))
        .range([0, barGraphWidth]);

  const yAxisScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([barGraphHeight, 0]); // flipped, so zero starts from bottom

  // SVG Element --------------------
  const svg = d3.select('body')
        .append('div').attr('id','svg-container')
        .append('svg')
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)

  // X-Axis -------------------------
  const xAxis = svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(${margin.left}, ${barOffsetY})`)
        .call(d3.axisBottom(xAxisScale)
              .ticks(10));

  // Y-Axis -------------------------
  const yAxis = svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yAxisScale));

  // Bar Graph ----------------------
  const bars = svg.append('g')
        .attr('id', 'bars')
        .attr('fill', 'steelblue')
        .selectAll('rect')
        .data(data)
        .enter()
  // appending individual bars for data
        .append('rect')
        .attr('class', 'bar')
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])
        .attr('x', (d, i) => (i * barWidth) + barOffsetX)
        .attr('y', d => barOffsetY - yScale(d[1]))
        .attr('width', barWidth)
        .attr('height', d => yScale(d[1]))
        .on('mouseover', (d, i) => {
          const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
          tooltip
            .attr('data-date', d[0])
            .attr('data-gdp', d[1])
            .style('visibility', 'visible')
            .style('left', `${pos.x}px`)
            .text(`Date: ${d[0]}\nGDP: ${d[1]}`)
        })
        .on('mousemove', (d, i) => {
          const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
          tooltip
            .style('top', `${pos.y}px`)
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden')
        });
}

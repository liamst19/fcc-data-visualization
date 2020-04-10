
// Run when the whole page DOM has been loaded from the html file.
document.addEventListener('DOMContentLoaded', ()=> {
  appendScatterplotGraph();
})

// Fetch Data from External Source
const fetchData = async () => {
  const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

  const response = await fetch(dataUrl);
  if(response.ok){
    return await response.json();
  } else {
    console.log('Error, status:', response.status);
    return null;
  }
}

/* Data Sample
  {
  Doping: "Alleged drug use during 1995 due to high hematocrit levels"
  Name: "Marco Pantani"
  Nationality: "ITA"
  Place: 1
  Seconds: 2210
  Time: "36:50"
  URL: "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
  Year: 1995
  }
*/

const appendScatterplotGraph = async () => {

  const svgGraphRect = {
    width: 700,
    height: 500,
    margin: {
      left: 45,
      right: 20,
      top: 10,
      bottom: 20
    }
  }
  const dotRadius = 6; // px
  const selectColor = doping => doping ? 'steelblue' : 'orange';

  // Get Data
  const data = await fetchData();
  if(!data){
    d3.select('#title')
      .text('Error: No Data');
    return; // exit on error
  }

  console.log(data.map(d => d.Doping))

  // Titles
  d3.select('#title')
    .text('Doping in Professional Bicycle Racing');
  d3.select('#title2')
    .text('35 Fastest times up Alpe d\'Huez');

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

  // Measurements
  const svgHeight = svgGraphRect.height + svgGraphRect.margin.top + svgGraphRect.margin.bottom;
  const svgWidth = svgGraphRect.width + svgGraphRect.margin.left + svgGraphRect.margin.right;

  const graphWidth = svgGraphRect.width;
  const graphHeight = svgGraphRect.height;
  const offsetX = svgGraphRect.margin.left;
  const offsetY = svgGraphRect.height + svgGraphRect.margin.top;

  const svg = d3.select('#chart')
        .attr('viewBox', [0, 0, svgWidth, svgHeight]);

  // Scales
  const minYear = new Date(d3.min(data, d => d.Year - 1), 0, 1);
  const maxYear = new Date(d3.max(data, d => d.Year + 1), 0, 1);

  const xScale = d3.scaleUtc()
        .domain([minYear, maxYear])
        .range([0, graphWidth]);

  const xAxisScale = d3.scaleUtc()
        .domain([minYear, maxYear])
        .range([0, graphWidth]);

  const minTime = new Date(0, 0, 0, 0, 0, d3.min(data, d => d.Seconds));
  const maxTime = new Date(0, 0, 0, 0, 0, d3.max(data, d => d.Seconds));

  const yScale = d3.scaleUtc()
        .domain([minTime, maxTime])
        .range([0, graphHeight]);

  const yAxisScale = d3.scaleUtc()
        .domain([maxTime, minTime])
        .range([graphHeight, 0])

  // Axes
  const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%Y'));

  const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%M:%S'));

  // Append Axes
  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${svgGraphRect.margin.left}, ${offsetY})`)
    .call(xAxis);

  svg.append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${svgGraphRect.margin.left}, ${svgGraphRect.margin.top})`)
    .call(yAxis);

  // Append Scatterplot Graph
  svg.append('g')
    .attr('id', 'graph')
    .attr('transform', `translate(${svgGraphRect.margin.left}, ${svgGraphRect.margin.top})`)
    .selectAll('rect')
    .data(data)
    .enter()
  // Individual Data
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', d => new Date(d.Year, 0, 1))
    .attr('data-yvalue', d => new Date(0, 0, 0, 0, 0, d.Seconds))
    .attr('r', dotRadius)
    .attr('fill', d => selectColor(d.Doping))
    .attr('cx', d => xScale(new Date(d.Year, 0, 1)))
    .attr('cy', d => yScale(new Date(0, 0, 0, 0, 0, d.Seconds)))
    .on('mouseover', (d, i) => {
      const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
      tooltip
        .attr('data-year', new Date(d.Year, 0, 1))
        .style('visibility', 'visible')
        .style('left', `${pos.x}px`)
        .style('top', `${pos.y}px`)
        .text(`${d.Name} : ${d.Nationality}\nYear: ${d.Year}\nTime: ${d.Seconds} ${d.Doping ? `\n${d.Doping}` : '' }`)
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden')
    });


  // Legend
  const legend = svg.append('g')
        .attr('id', 'legend')

  const legendSize = 15;
  const legendTop = svgGraphRect.margin.top + 50;
  const legendRight = svgGraphRect.width - svgGraphRect.margin.right - 50;
  const legendSpacing = 5;

  legend.append('rect')
    .attr('fill', selectColor(true))
    .attr('width', legendSize)
    .attr('height', legendSize)
    .attr('x', legendRight)
    .attr('y', legendTop)

  legend.append('text')
    .text('Doping Allegations')
    .style('font-size', 8)
    .attr('x', legendRight)
    .attr('y', legendTop)

  legend.append('rect')
    .attr('fill', selectColor(false))
    .attr('width', legendSize)
    .attr('height', legendSize)
    .attr('x', legendRight)
    .attr('y', legendTop + legendSize + legendSpacing)

  legend.append('text')
    .text('No Doping Allegations')
    .style('font-size', 8)
    .attr('x', legendRight)
    .attr('y', legendTop + legendSize + legendSpacing)

}

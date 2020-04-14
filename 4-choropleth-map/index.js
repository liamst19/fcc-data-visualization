const ED_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const MAP_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

// Run when the whole page DOM has been loaded from the html file.
document.addEventListener('DOMContentLoaded', ()=> {
  // Load data
  Promise.all([d3.json(ED_URL), d3.json(MAP_URL)])
    .then(values => drawMap(...values));
});

const dimensions = {
  width: 1000,
  height: 720,
  margin: {
    top: 20,
    bottom: 20,
    left: 44,
    right: 20
  }
}

// Draw the Choropleth Map
const drawMap = (data, map) => {
  console.log('data', data);
  console.log('map', map);

  const bachelorsOrHigher = data.map(d => d.bachelorsOrHigher);

  const svgWidth = dimensions.width
        + dimensions.margin.left
        + dimensions.margin.right;
  const svgHeight = dimensions.height
        + dimensions.margin.top
        + dimensions.margin.bottom;

  const offsetX = dimensions.width - dimensions.margin.left;
  const offsetY = dimensions.height + dimensions.margin.top;

  const color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
    .range(d3.schemeGreens[9]);

  const svg = d3.select('#svg-map')
        .attr('viewBox', [0, 0, svgWidth, svgHeight]);

  // Tooltip
  const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip');
  const getTooltipPos = (x, y) => ({ x: x + 10, y: y + 5 });

  // Legend
  const legendWidth = 300;
  const legendHeight = 8;
  const legendScale = d3.scaleLinear()
        .domain(d3.extent(bachelorsOrHigher))
        .range([0, legendWidth]);

  const legend = svg.append('g')
    .attr('transform', `translate(${offsetX - legendWidth}, ${dimensions.margin.top})`)
    .attr('id', 'legend')

  // Legend Axis
  legend.append('g')
    .attr('id', 'legend-axis')
    .attr('transform', `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendScale)
          .tickFormat(v => `${Math.round(v)}%`))


  // Legend Colors
  legend.append('g')
    .selectAll('rect')
    .data(color.range().map(d => {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = legendScale.domain()[0];
      if (d[1] == null) d[1] = legendScale.domain()[1];
      return d;
    }))
    .enter().append('rect')
    .attr('height', legendHeight)
    .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
    .attr('x', d => legendScale(d[0]))
    .attr('fill', d => color(d[0]))


  // Map
  const path = d3.geoPath();
  svg.append("g")
    .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(map, map.objects.counties).features)
    .enter().append("path")
    .attr('d', path)
    .attr("class", "county")
    .attr('data-fips', d => {
      const r = data.filter(t => t.fips === d.id)[0];
      return r ? r.fips : 'n/a';
    })
    .attr('data-education', d => {
      const r = data.filter(t => t.fips === d.id)[0];
      return r ? r.bachelorsOrHigher : 'n/a';
    })
    .attr('fill', d => {
      const r = data.filter(t => t.fips === d.id)[0];
      return r ? color(r.bachelorsOrHigher) : color(0);
    })
    .on('mouseover', (d, i) => {
      const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
      const r = data.filter(t => t.fips === d.id)[0];
      const ed = r ? r.bachelorsOrHigher : 'n/a';
      tooltip
        .attr('data-education', ed)
        .style('visibility', 'visible')
        .style('left', `${pos.x}px`)
        .style('top', `${pos.y}px`)
        .text(`${r.area_name}, ${r.state}: ${ ed }%`)
    })
    .on('mouseout', () => {
      tooltip
        .style('visibility', 'hidden')
        .text('')
    })

  svg.append("path")
    .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
    .datum(topojson.mesh(map, map.objects.states, (a, b) => a !== b))
    .attr("stroke", '#eee')
    .attr('fill', 'none')
    .attr("d", path);

}

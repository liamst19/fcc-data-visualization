const DATA_URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const svgDimensions = {
  width: 700,
  height: 500,
  margin: {
    left: 60,
    right: 20,
    top: 10,
    bottom: 40
  }
}

var colorbrewer = {
  RdYlBu: {
    3: ["#fc8d59","#ffffbf","#91bfdb"],
    4: ["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
    5: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
    6: ["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
    7: ["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
    8: ["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],
    9: ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],
    10: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],
    11: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
  },
  RdBu: {
    3: ["#ef8a62","#f7f7f7","#67a9cf"],
    4: ["#ca0020","#f4a582","#92c5de","#0571b0"],
    5: ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
    6: ["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],
    7: ["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],
    8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
    9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
    10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],
    11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
  }
};

// Run when the whole page DOM has been loaded from the html file.
document.addEventListener('DOMContentLoaded', ()=> {
  d3.json(DATA_URL).then(json => {
/* Data:
  {
    month: 1
    variance: -1.366
    year: 1753
  }
*/
    const data = json.monthlyVariance;
    const baseTemperature = json.baseTemperature;

    const minYear = new Date(d3.min(data, d => d.year), 0, 1);
    const maxYear = new Date(d3.max(data, d => d.year), 0, 1);
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          .map(m => new Date(1600, m, 0));
    const years = data.reduce((domain, d) => domain.some(m => m === d.year)
                              ? domain
                              : [...domain, d.year] ,[]);
    const variances = data.map(d => d.variance)
    const legendCellSize = 30;
    const cellCount = 11;

    const minTemp = d3.min(variances, v => v + baseTemperature);
    const maxTemp = d3.max(variances, v => v + baseTemperature);

    const bandWidthY = svgDimensions.height / months.length;
    const bandWidthX = 5;

    const offsetX = svgDimensions.margin.left;
    const offsetY = svgDimensions.height + svgDimensions.margin.top;

    const chartWidth = bandWidthX * years.length;

    const svgHeight = svgDimensions.height + svgDimensions.margin.top + svgDimensions.margin.bottom + 200;
    const svgWidth = chartWidth + svgDimensions.margin.left + svgDimensions.margin.right;

    d3.select('#svg-container')
          .attr('style', `width: ${svgWidth}px; height:${svgHeight}px`)

    const svg = d3.select('#chart')
          .attr('viewBox', [0, 0, svgWidth, svgHeight])

    // Tooltip
    const tooltip = d3.select('body')
          .append('div')
          .attr('id', 'tooltip');
    const getTooltipPos = (x, y) => {
      return {
        x: x + 10,
        y: y + 5
      }
    }

    // Scales
    const yearRange = d3.timeYear.range(minYear, maxYear, 1);

    const xScale = d3.scaleBand()
          .domain(years)
          .range([0, chartWidth]);
    const yScale = d3.scaleBand()
          .domain(months)
          .range([0, svgDimensions.height]);
    const varianceScale = d3.scaleThreshold()
          .domain(variances)
          .range(colorbrewer.RdYlBu[cellCount].reverse())

    // Axes
    const xAxis = d3.axisBottom(xScale)
          .tickValues(years.filter(y => y % 10 === 0));

    const yAxis = d3.axisLeft(yScale)
          .tickFormat(d3.timeFormat('%B'));

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(${svgDimensions.margin.left}, ${offsetY})`)
      .call(xAxis);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${svgDimensions.margin.left}, ${svgDimensions.margin.top})`)
      .call(yAxis);

    // Legend

    const legendY = offsetY + svgDimensions.margin.top + svgDimensions.margin.bottom;
    const legendX = svgDimensions.margin.left;

    const legend = svg.append('g')
          .attr('id', 'legend')
          .attr('transform', `translate(${legendX}, ${legendY})`)
          .selectAll('rect')
          .data(varianceScale.range())
          .enter()
          .append('rect')
          .attr('fill', d => d)
          .attr('width', legendCellSize)
          .attr('height', legendCellSize)
          .attr('x', (d, i) => i * legendCellSize)

    const legendScale = d3.scaleLinear()
          .domain(d3.extent([minTemp, maxTemp]))
          .range([0, legendCellSize * cellCount]);
    const legendAxis = d3.axisBottom(legendScale)

    svg.append('g')
      .attr('id', 'legend-axis')
      .attr('transform', `translate(${legendX}, ${legendY + legendCellSize})`)
      .call(legendAxis)

    // Chart
    const chart = svg.append('g')
          .attr('id', 'chart')
          .attr('transform', `translate(${svgDimensions.margin.left}, ${svgDimensions.margin.top})`)
          .selectAll('rect')
          .data(data)
          .enter()
          .append('rect')
          .attr('data-year', d => d.year)
          .attr('data-month', d => d.month - 1)
          .attr('data-temp', d => baseTemperature + d.variance)
          .attr('class', 'cell')
          .attr('x', d => xScale(d.year))
          .attr('y', d => yScale(new Date(1600, d.month, 0)))
          .attr('width', bandWidthX)
          .attr('height', bandWidthY)
          .attr('fill', d => varianceScale(d.variance))
          .on('mouseover', (d, i) => {
            const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
            tooltip
              .attr('data-year', d.year)
              .attr('data-earmonth', d.month)
              .style('visibility', 'visible')
              .style('left', `${pos.x}px`)
              .style('top', `${pos.y}px`)
              .text(`${d.month}/${d.year} ${baseTemperature + d.variance}`)
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
          });

  })
})

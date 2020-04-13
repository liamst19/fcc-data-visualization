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
    const baseTemp = json.baseTemperature;
    const data = json.monthlyVariance.map(d => ({...d, temperature: parseFloat((d.variance + baseTemp).toPrecision(5))}));

    const minYear = new Date(d3.min(data, d => d.year), 0, 1);
    const maxYear = new Date(d3.max(data, d => d.year), 0, 1);
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          .map(m => new Date(1600, m, 0));
    const years = data.reduce((domain, d) => domain.some(m => m === d.year)
                              ? domain
                              : [...domain, d.year] ,[]);
    const temperatures = data.map(d => d.temperature);
    const legendCellSize = 30;
    const cellCount = 11;

    const minTemp = d3.min(temperatures);
    const maxTemp = d3.max(temperatures);

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

    const tempDomain = [...Array(cellCount).keys()].map(i => (i + minTemp) * ((maxTemp - minTemp) / cellCount));
    const colors = d3.schemeRdYlBu[cellCount].reverse();
    const tempColor = d3.scaleThreshold()
          .domain(tempDomain)
          .range(colors)

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

    const legendScale = d3.scaleLinear()
          .domain([minTemp, maxTemp])
          .range([0, legendCellSize * cellCount]);

    const legendAxis = d3.axisBottom(legendScale)
          .tickValues(tempDomain)
          .tickFormat(d3.format(".1f"))

    svg.append('g')
      .attr('id', 'legend-axis')
      .attr('transform', `translate(${legendX}, ${legendY + legendCellSize})`)
      .call(legendAxis)

    svg.append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`)
      .selectAll('rect')
      .data(tempColor.range())
      .enter()
      .append('rect')
      .attr('fill', d => d)
      .attr('width', legendCellSize)
      .attr('height', legendCellSize)
      .attr('x', (d, i) => i * legendCellSize)

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
          .attr('data-temp', d => d.temperature)
          .attr('class', 'cell')
          .attr('x', d => xScale(d.year))
          .attr('y', d => yScale(new Date(1600, d.month, 0)))
          .attr('width', bandWidthX)
          .attr('height', bandWidthY)
          .attr('fill', d => tempColor(d.temperature))
          .on('mouseover', (d, i) => {
            const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
            tooltip
              .attr('data-year', d.year)
              .attr('data-earmonth', d.month)
              .style('visibility', 'visible')
              .style('left', `${pos.x}px`)
              .style('top', `${pos.y}px`)
              .text(`${d.month}/${d.year} ${d.temperature}`)
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
          });

  })
})

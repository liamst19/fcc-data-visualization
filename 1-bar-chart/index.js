document.addEventListener('DOMContentLoaded', ()=> {

  doBarGraph();

})

const doBarGraph = async () => {
  const dimension = {width: 800, height: 500}
  const margin = {top: 10, bottom: 25, left: 45, right: 20};

  const obj = await fetchData();
  if(!obj){
    return;
  }

  const data = obj.data;

  const title = d3.select('body')
    .append('h1')
    .attr('id', 'title')
    .text(obj.name);

  const tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')

  const xScale = d3.scaleUtc()
        .domain(d3.extent(data, d => d[0]).map(d => new Date(d)))
        .range([margin.left, dimension.width - margin.right])

  const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([0, dimension.height])

  const yAxisScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([dimension.height, 0])

  const svg = d3.select('body')
        .append('svg')
        .attr('width', dimension.width + margin.left + margin.right)
        .attr('height', dimension.height + margin.top + margin.bottom)

  const barWidth = (dimension.width - margin.left - margin.right) / data.length;

  const barOffsetX = margin.left;
  const barOffsetY = dimension.height + margin.top;

  const bars = svg.append('g')
        .attr('id', 'bars')
        .attr('fill', 'steelblue')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])
        .attr('x', (d, i) => i * barWidth + margin.left)
        .attr('y', d => barOffsetY - yScale(d[1]))
        .attr('width', barWidth)
        .attr('height', d => yScale(d[1]))
        .on('mouseover', (d, i) => {
          tooltip
            .attr('data-date', d[0])
            .attr('data-gdp', d[1])
            .style('visibility', 'visible')
            .style('left', `${d3.event.pageX + 10}px`)
            .style('top', `${d3.event.pageY}px`)
            .text(`Date: ${d[0]}\nGDP: ${d[1]}`)
        })
        .on('mouseout', () => { tooltip.style('visibility', 'hidden')})

  const xAxis = svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${dimension.height + margin.top})`)
        .call(d3.axisBottom(xScale)
              .ticks(10))

  const yAxis = svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yAxisScale))

}

const fetchData = async () => {
  const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json');

  if(response.ok){
    return await response.json();
  } else{
    console.log('data fetch failed status:', response.status);
    return null;
  }

};

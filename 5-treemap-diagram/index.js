
const urls = ['https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
]

// Run when the whole page DOM has been loaded from the html file.
document.addEventListener('DOMContentLoaded', ()=> {
  // Load data
  Promise.all([d3.json(urls[1])])
    .then(values => drawMap(...values));
});


const drawMap = (data) => {

  const dimensions = {
    height: 600,
    width: 800,
    legend: {
      cellSize: 15,
      cellWidth: 80,
      width: 300,
      height: 50
    },
    margin: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    }
  }

  // Tooltip
  const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip');
  const getTooltipPos = (x, y) => ({ x: x + 10, y: y + 5 });

  const svgWidth = dimensions.width + dimensions.margin.left + dimensions.margin.right;
  const svgHeight = dimensions.height + dimensions.legend.height + dimensions.margin.top + dimensions.margin.bottom;

  const svg = d3.select('#chart')
        .attr('viewBox', [0, 0, svgWidth, svgHeight]);

  // Colorscale
  const categories = data.children.map(c => c.name)
  const color = category => {
    return d3.schemeCategory10[categories.indexOf(category)];
  }

  // Legend
  const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${ dimensions.margin.left * 3 }, ${ dimensions.margin.top })`)

  legend.append('g')
    .selectAll('rect')
    .data(categories).enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', dimensions.legend.cellSize)
    .attr('height', dimensions.legend.cellSize)
    .attr('x', (d, i) => i * dimensions.legend.cellWidth)
    .attr('fill', d => color(d))

  legend.append('g')
    .selectAll('text')
    .data(categories).enter()
    .append('text')
    .text(d => d)
    .attr('x', (d, i) => (i * dimensions.legend.cellWidth) + (dimensions.legend.cellSize + 5))
    .attr('y', dimensions.legend.cellSize - 3)

  // Treemap
  const root = d3.hierarchy(data).sum(d => d.value);
  d3.treemap()
    .size([dimensions.width, dimensions.height])
    .padding(2)(root)

  svg
    .append('g')
    .attr('transform', `translate(${ dimensions.margin.left }, ${ dimensions.legend.height })`)
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr('class', 'tile')
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('transform', (d, i) => `translate(${ d.x0 }, ${ d.y0 })`)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .style("stroke", "black")
    .style("fill", d => color(d.data.category))
    .on('mouseover', (d, i) => {
      const pos = getTooltipPos(d3.event.pageX, d3.event.pageY);
      tooltip
        .attr('data-name', d.data.name)
        .attr('data-category', d.data.category)
        .attr('data-value', d.data.value)
        .style('visibility', 'visible')
        .style('left', `${pos.x}px`)
        .style('top', `${pos.y}px`)
        .text(`${d.data.name}, ${d.data.category}: \$${ d.data.value }`)
    })
    .on('mouseout', () => {
      tooltip
        .style('visibility', 'hidden')
        .text('')
    })

  svg
    .append('g')
    .attr('transform', `translate(${ dimensions.margin.left }, ${ dimensions.legend.height })`)
    .selectAll('g')
    .data(root.leaves()).enter()
    .append('g')
    .attr('font-size', 10)
    .attr('transform', (d, i) => `translate(${ d.x0 + 5 }, ${ d.y0 + 15 })`)
    .selectAll('text')
    .data(d => d.data.name.split(' ')).enter()
    .append('text')
    .text(d => d)
    .attr('transform', (d, i) => `translate(0, ${ i * 10 })`)

}

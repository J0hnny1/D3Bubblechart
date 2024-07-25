function getData(url) {
    return new Promise((resolve, reject) => {
        d3.csv("http://localhost:3000/api/" + url, res => {
            resolve(res);
        })
    })
}

function cleanData(data) {
    const match = data.match(/^(\d+(\.\d+)?)([KM])?$/i);
    if (!match) return NaN;

    const number = parseFloat(match[1]);
    const unit = match[3] && match[3].toUpperCase();

    const multipliers = {
        'K': 1000,
        'M': 1000000
    };

    return number * (multipliers[unit] || 1);
}

const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

Promise.all([getData("getPop"), getData("getGdp"), getData("getLex")]).then(result => {
    console.log('kp', result);
    const population = result[0];
    const gdp = result[1];
    const lex = result[2];

    const svg = d3
        .select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background", "white")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const combined = population.map((element, index) => ({
        population: cleanData(element['2024']),
        gdp: cleanData(gdp[index]['2024']),
        lex: lex[index]['2024'],
        country: element.country
    }))

    console.log('Combined Data', combined)
    const xScale = d3
        .scaleLinear()
        .domain([
            0,
            93000,
        ])
        .range([45, width]);

    const yScale = d3
        .scaleLinear()
        .domain([
            0,
            100,
        ])
        .range([height, 0]);

    const rScale = d3
        .scaleLinear()
        .domain([
            0,
            15000000,
        ])
        .range([2, 19]);

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "25")
        .style("visibility", "hidden")

    svg.selectAll("circle")
        .data(combined).enter()
        .append("circle")
        .attr("cx", (d) => {
            return xScale(d?.gdp - rScale(d?.population) / 2);
        })
        .attr("cy", (d) => {
            console.log("zweites:" + d?.lex)
            return yScale(d?.lex)
        })
        .attr("r", (d) => {
            return rScale(d?.population)
        })
        .on("mouseover", (d) => {
            tooltip.text(`${d.country} \n GDP: ${d.gdp} Population: ${d.population} \n Lex: ${d.lex}`)
            return tooltip
                .style("visibility", "visible")
                .style("top", `${d3.event.pageY - 10}px`)
                .style("left", `${d3.event.pageX + 15}px`)

        })
        .on("mouseout", (d) => {
            return tooltip.style("visibility", "hidden");
        })
        .attr("fill", (d, i) => randomColor())

    const xAxis = d3.axisBottom(xScale)
        .ticks(5);

    const yAxis = d3.axisLeft(yScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(0, + ${height}, ${margin.top})`)
        .call(yAxis);

})
const colorPalette = [
    '#f7fbff',
    '#deebf7',
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b'
];

function randomColor() {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function changeYear() {
    console.log('year changed', document.getElementById('year').value)
}

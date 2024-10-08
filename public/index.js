function getData(url) {
    return new Promise((resolve, reject) => {
        d3.csv("http://localhost:3000/api/" + url, res => {
            resolve(res);
        })
    })
}

let selectedYear = 2024
let population, gdp, lex, svg, xScale, yScale, rScale

const continentMap = {
    Afghanistan: 'Asia',
    Angola: 'Africa',
    Albania: 'Europe',
    Andorra: 'Europe',
    UAE: 'Asia',
    Argentina: 'South America',
    Armenia: 'Asia',
    'Antigua and Barbuda': 'North America',
    Australia: 'Oceania',
    Austria: 'Europe'
};

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
    population = result[0];
    gdp = result[1];
    lex = result[2];

    svg = d3
        .select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background", "white")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const combined = population.map((element, index) => ({
        population: cleanData(element[selectedYear]),
        gdp: cleanData(gdp[index][selectedYear]),
        lex: lex[index][selectedYear],
        country: element.country
    }))

    console.log('Combined Data', combined)
    xScale = d3
        .scaleLinear()
        .domain([
            0,
            93000,
        ])
        .range([45, width]);

    yScale = d3
        .scaleLinear()
        .domain([
            0,
            100,
        ])
        .range([height, 0]);

    rScale = d3
        .scaleLinear()
        .domain([
            0,
            12000000,
        ])
        .range([4, 14]);

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
        .attr("fill", (d, i) => colorScale(continentMap[d.country]))
        .style("opacity", "80%")

    const xAxis = d3.axisBottom(xScale)

    const yAxis = d3.axisLeft(yScale)

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(0, + ${height}, ${margin.top})`)
        .call(yAxis);

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("income per capita, inflation-adjusted (dollars)");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("life expectancy (years)");
})

const colorScale = d3.scaleOrdinal()
    .domain(['Asia', 'Africa', 'Europe', 'South America', 'North America', 'Oceania'])
    .range(['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#8c564b']);

function changeYear() {
    const value = document.getElementById('year').value
    console.log('year changed', value)
    document.getElementById('sliderValue').textContent = value
    selectedYear = value
    const combined = population.map((element, index) => ({
        population: cleanData(element[selectedYear]),
        gdp: cleanData(gdp[index][selectedYear]),
        lex: lex[index][selectedYear],
        country: element.country
    }))
    svg.selectAll("circle")
        .data(combined)
        .transition()
        .duration(500)
        .attr("cx", (d) => {
            return xScale(d?.gdp - rScale(d?.population) / 2);
        })
        .attr("cy", (d) => {
            return yScale(d?.lex)
        })
        .attr("r", (d) => {
            return rScale(d?.population)
        })
}

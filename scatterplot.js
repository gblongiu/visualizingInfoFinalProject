// Set chart size
const CHART_SIZE = 600;

// Load the dataset
(async () => {

    const data = await d3.csv("./rym_clean1.csv");
    const top20Data = data.sort((a,b) => (a.avg_rating > b.avg_rating)
        ? -1 : ((b.avg_rating > a.avg_rating) ? 1 : 0)).slice(0,70);

    // Define scales for x and y axes
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(top20Data, function (d) { return d.rating_count; })])
        .range([0, CHART_SIZE]);
    let yScale = d3.scaleLinear()
        .domain([d3.min(top20Data, function (d) { return parseFloat(d.avg_rating); }),
            d3.max(top20Data, function (d) { return parseFloat(d.avg_rating); })])
        .range([CHART_SIZE, 0]);

    // Define a color scale for the x-axis
    let xColorScale = d3.scaleSequential(d3.interpolateTurbo)
        .domain([0, d3.max(data, function (d) { return d.rating_count; })]);

    // Define a color scale for the y-axis
    let yColorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([d3.min(data, function (d) { return parseFloat(d.avg_rating); }),
            d3.max(data, function (d) { return parseFloat(d.avg_rating); })]);

    // Combine the two color scales
    let combinedColorScale = d3.scaleSequential()
        .domain([0,1])
        .interpolator(d3.interpolateRgb(d3.color(xColorScale(0)), d3.color(yColorScale(1))));

    const margin = { top: 70, right: 80, bottom: 45, left: 80 };

    const albumList = d3.select("body")
        .append("div")
        .attr("id", "album-list")
        .style("position", "absolute")
        .style("top", "200px")
        .style("right", "30px")
        .style("width", "390px")
        .style("height", "440px")
        .style("overflow", "scroll")
        .style("padding", "10px")
        .style("border", "2px solid black");

    let counter = 1;

    albumList.selectAll("p")
        .data(top20Data)
        .enter()
        .append("p")
        .text(function(d) { return `${counter++}. ${d.artist_name} - ${d.release_name}`; });

    // Create the scatterplot
    let svg = d3.select("svg")
        .attr("width", CHART_SIZE*2)
        .attr("height", CHART_SIZE*2);

    svg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .selectAll("circle")
        .data(top20Data)
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return xScale(d.rating_count); })
        .attr("cy", function (d) { return yScale(d.avg_rating); })
        .attr("id", function (d) { return d.release_date; })
        .attr("fill", function(d) { return combinedColorScale((d.rating_count
                / d3.max(data, function (d) { return d.rating_count; }))
            * (parseFloat(d.avg_rating) / d3.max(data, function (d)
            { return parseFloat(d.avg_rating); }))); })
        .on("mouseover", function (d) {
            // Increase size of circle and change color on hover
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 10)
                .style("fill", "black");

            // Show the tooltip
            let tooltip = d3.select("#tooltip");
            tooltip.style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px")
                .html(`Artist: ${d.artist_name}
<br>Album: ${d.release_name}
<br>Avg Rating: ${parseFloat(d.avg_rating)}
<br>Rating Count: ${d.rating_count}`);
        })

        .on("mouseout", function (d) {
            // Reset the
            // circle on
            // mouseout
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 5)
                .style("fill", function(d) { return combinedColorScale
                (d.avg_rating, d.rating_count); });

            // Hide the tooltip
            let tooltip = d3.select("#tooltip");
            tooltip.style("visibility", "hidden");
            tooltip.style("padding-left", "15px");
            tooltip.style("padding-top", "15px");
        });

    // Add chart title
    svg.append("text")
        .attr("x", CHART_SIZE / 1.5)
        .attr("y", 55)
        .attr("font-weight", 700)
        .style("text-anchor", "middle")
        .style("font-size", "30px")
        .text("70 Top-Rated Albums on Rate Your Music");

    // Add y-axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yScale));

    // Add x-axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left +
            "," + (CHART_SIZE + margin.top) + ")")
        .call(d3.axisBottom(xScale));

    // Add x-axis label
    svg.append("text")
        .attr("transform", "translate(" + (CHART_SIZE/1.80 + margin.left) +
            "," + (CHART_SIZE + margin.top + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Rating Count");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left/5)
        .attr("x", 0 - (CHART_SIZE / 2 + margin.top))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Rating");

})();
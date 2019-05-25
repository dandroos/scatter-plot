const req = new XMLHttpRequest();
req.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
req.onreadystatechange = () => {
    if (req.readyState === 4 && req.status === 200) {
        const json = JSON.parse(req.responseText);
        plot_graph(json);
    }
}
req.send();

//////////////////////////////////////////////

const plot_graph = (json) => {

    // CONFIG

    const width = 750,
        height = 500;

    const margins = {
        x: 50,
        y: 50
    };

    const svg_width = width - margins.x,
        svg_height = height - margins.y;

    // FUNCTIONS

    const get_date = (year, seconds, hours = 0) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds - (mins * 60);
        const date = new Date(year, 0, 1, hours, mins, secs);
        return date;
    }

    const get_time = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds - (mins * 60);
        const time = new Date(1970, 0, 1, 0, mins, secs);
        return time;
    }

    const get_year = (year) => {
        return new Date(year, 0)
    }

    // D3

    d3.select('#scatter')
        .append('h1')
            .attr('id', 'title')
            .text('Doping in Professional Bicycle Racing');

    d3.select('#scatter')
        .append('h2')
            .attr('id', 'subtitle')
            .text("35 Fastest times up Alpe d'Huez")
    const tooltip =
            d3.select('#scatter').append('div')
            .attr('id', 'tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')

    const svg =
        d3.select('#scatter')
        .append('svg')
        .attr('id', 'svg')
        .attr('viewBox', `0 0 ${svg_width} ${svg_height}`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        ;

    const dates_array = json.map((i) => get_date(i.Year, i.Seconds)).sort((a, b) => a - b)

    const x_scale =
        d3.scaleTime()
        .domain([new Date(dates_array[0].getFullYear() - 1, 0), new Date(dates_array[dates_array.length - 1].getFullYear() + 1, 0)])
        .range([30, svg_width - margins.x - 15])

    const x_axis =
        d3.axisBottom(x_scale)

    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(${margins.x}, ${svg_height - margins.y / 2})`)
        .call(x_axis);

    

    const times_array = json.map((i) => get_time(i.Seconds)).sort((a, b) => a - b)

    times_array[0].setSeconds(times_array[0].getSeconds() - 10);
    times_array[times_array.length - 1].setSeconds(times_array[times_array.length - 1].getSeconds() + 10);

    const y_scale =
        d3.scaleTime()
        .domain([times_array[0], times_array[times_array.length - 1]])
        .range([0, svg_height - margins.y / 2])

    const y_axis = d3.axisLeft(y_scale)
        .ticks(16)
        .tickFormat((d) => {
            const secs = d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds();
            return `${d.getMinutes()}:${secs}`
        });

    svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margins.x + 30}, 0)`)
        .call(y_axis)

       svg.append('text')
        .attr('x', -180)
        .attr('y', 30)
        .attr('transform', 'rotate(270)')
        .style('text-anchor', 'middle')
        .text('Time (mm:ss)')

    const dots =
        svg.selectAll('circle')
        .data(json)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('class', (d) => {
            if (d.Doping !== '') {
                return 'dot danger'
            } else {
                return 'dot safe'
            }
        })
        .attr('data-xvalue', (d) => {
            return d.Year
        })
        .attr('data-yvalue', (d) => {
            return get_time(d.Seconds)
        })
        .attr('r', 5)
        .attr('cx', (d) => {
            return x_scale(get_year(d.Year))
        })
        .attr('cy', (d) => y_scale(get_time(d.Seconds)))
        .attr('transform', `translate(${margins.x}, 0)`)
        .on('mouseover', (d) => {
            var tooltip_html = `<strong>Name:</strong> ${d.Name} (${d.Nationality})<br><strong>Year:</strong> ${d.Year} &emsp;  <strong>Time:</strong> ${d.Time}`
            if (d.Doping !== '') {
                tooltip_html += `<br><br>${d.Doping}`
            }
            tooltip.html(tooltip_html)
                .style('visibility', 'visible')
                .style('top', `${d3.event.pageY}px`)
                .style('left', `${d3.event.pageX+10}px`)
                .attr('data-year', (d.Year))
        })
        .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
        });

    const legend =
        svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${width - 250}, 50)`)
        .style('stroke-width', 3)
        .selectAll('g')
        .data(['Riders with no doping allegations', 'Riders with doping allegations'])
        .enter();

        legend.append('rect')
        .attr('id', 'legend_border')

        
        .attr('x', -20)
        .attr('y', -25)

    legend.append('circle')
        .attr('r', 5)
        .attr('class', (d) => {
            if (d === 'Riders with no doping allegations') {
                return 'safe'
            } else {
                return 'danger'
            }
        })  
        .attr('cy', (d, i) => i * 20)
        .attr('transform', 'translate(0, -4)')
    legend.append('text')
        .text((d) => d)
        .attr('y', (d, i) => i * 20)
        .attr('x', 20)

    

   



}
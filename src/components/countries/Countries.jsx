import { useState, useEffect, useRef } from 'react'
import data from '../../data/data.json'
import * as d3 from 'd3'
import './styles.css'

const Countries = () => {
  const [svgWidth, setSvgWidth] = useState(0)
  const [svgHeight, setSvgHeight] = useState(0)
  const [location, setLocation] = useState()
  const [proportion, setProportion] = useState()
  const [count, setCount] = useState()
  const svgRef = useRef()
  function getCountryData(country, data, index) {
    let countries = data.filter((d) => d.country === country)
    let proportion = 0
    let count = 0
    countries.forEach((c) => {
      proportion += c.proportion
      count += 1
    })
    return { country: country, proportion: proportion, count: count, id: index }
  }
  const roundUpto = (number, upto) => {
    return Number(number.toFixed(upto))
  }
  function handleOver(e, d) {
    d3.select(this).style('stroke', 'black')
    const svg = d3.select(svgRef.current).select('svg')
    setLocation(d.country)
    setProportion(roundUpto(d.proportion * 100, 1) + '%')
    setCount(d.count)
  }
  function handleLeave(e, d) {
    d3.select(this).style('stroke', 'none')
    d3.select(svgRef.current).selectAll('.d3-countries-info').remove()
    setLocation()
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current).select('svg')
    svg.selectAll('*').remove()
    setSvgWidth(parseInt(svg.style('width')))
    setSvgHeight(parseInt(svg.style('height')))
    // const BUFFER = svgWidth * 0.4
    const bufferRight = svgWidth * 0.02
    const bufferLeft = svgWidth * 0.06
    const bufferVertical = svgHeight * 0.04
    const countriesSet = new Set()
    // data prep
    data.forEach((d) => {
      countriesSet.add(d.country)
    })
    let countryData = []
    countriesSet.forEach((country, index) => {
      countryData.push(getCountryData(country, data, index))
    })
    countryData = d3.sort(countryData, (d) => d.proportion)
    const maxProportion = d3.max(countryData, (d) => d.proportion)
    console.log(maxProportion)
    // x axis
    const xScale = d3
      .scaleLinear()
      .domain([0, countryData.length + 1])
      .range([bufferLeft, svgWidth - bufferRight])
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(countryData.length)
      .tickFormat((d) => {
        if (d !== 20 && d !== 0) {
          return d
        }
      })
    const xAxisG = svg.append('g').attr('transform', `translate(0,${svgHeight - bufferVertical})`)
    xAxis(xAxisG)
    // y axis
    const yScale = d3
      .scaleLinear()
      .domain([maxProportion, 0])
      .range([bufferVertical, svgHeight - bufferVertical])
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => Math.round(d * 100) + '%')
      .tickSizeOuter(0)
      .tickSizeInner(0)
    const yAxisG = svg.append('g').attr('transform', `translate(${bufferLeft}, ${0})`)
    yAxis(yAxisG)
    // render bars
    const barWidth = (svgWidth - bufferLeft - bufferRight) / countryData.length
    countryData.forEach((obj, index) => {
      svg
        .append('g')
        .selectAll('rect')
        .data([obj])
        .join('rect')
        .attr('x', xScale(index) + barWidth / 2)
        .attr('y', yScale(obj.proportion))
        .attr('width', barWidth - 6)
        .attr('height', yScale(0) - yScale(obj.proportion))
        .style('fill', '#2874a6')
        .on('mouseover', handleOver)
        .on('mouseleave', handleLeave)
    })
  }, [svgWidth, svgHeight])
  return (
    <div ref={svgRef} id='stocks-countries-container'>
      <div id='stocks-countries-header'>
        <h1>Geographical distribution</h1>
      </div>
      <hr />
      <div id='stocks-countries-chart'>
        <svg></svg>
      </div>
      <hr />
      <div id='stocks-countries-info'>
        {location ? (
          <div>
            <p>{location}</p>
            <p>Proportion of portfolio: {proportion}</p>
            <p>Number of investments: {count}</p>
          </div>
        ) : (
          <div>
            <p>Hover over a bar for more information</p>
          </div>
        )}
      </div>
    </div>
  )
}
export default Countries

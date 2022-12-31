import { useState, useEffect, useRef } from 'react'
import data from '../../data/data.json'
import * as d3 from 'd3'

import './styles.css'
const Performance = () => {
  const [svgWidth, setSvgWidth] = useState(0)
  const [svgHeight, setSvgHeight] = useState(0)
  const [symbol, setSymbol] = useState(0)
  const [location, setLocation] = useState()
  const [industry, setIndustry] = useState()
  const [proportion, setProportion] = useState()
  const [change, setChange] = useState()
  const svgRef = useRef()
  data = d3.sort(data, (d) => d.change)
  const roundUpto = (number, upto) => {
    return Number(number.toFixed(upto))
  }
  function handleOver(e, d) {
    d3.select(this).style('stroke', 'black')
    setSymbol(d.sybmol)
    setLocation(d.country)
    setIndustry(d.sector)
    setProportion(roundUpto(d.proportion * 100, 2) + '%')
    setChange(roundUpto(d.change * 100, 1) + '%')
  }
  function handleLeave(e, d) {
    d3.select(this).style('stroke', 'none')
    setSymbol()
  }
  useEffect(() => {
    const svg = d3.select(svgRef.current).select('svg')
    svg.selectAll('*').remove()
    setSvgWidth(parseInt(svg.style('width')))
    setSvgHeight(parseInt(svg.style('height')))
    const minChange = d3.min(data, (d) => d.change)
    const maxChange = d3.max(data, (d) => d.change)
    const BUFFERW = svgWidth * 0.03
    const BUFFERH = svgHeight * 0.03
    const DataCount = data.length
    const barWidth = svgWidth / DataCount
    // y axis
    const yScale = d3
      .scaleLinear()
      .domain([maxChange, minChange])
      .range([BUFFERH, svgHeight - BUFFERH])
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => d * 100 + '%')

    const yAxisGroup = svg.append('g').attr('transform', `translate(${BUFFERW + 18}, 0)`)
    yAxis(yAxisGroup)
    // x scale
    const xScale = d3
      .scaleLinear()
      .domain([0, DataCount])
      .range([BUFFERW, svgWidth - BUFFERW])
    // color scale
    const colorRed = d3.scaleLinear().domain([minChange, 0]).range(['#680c07', '#bc544b'])
    const colorBlue = d3.scaleLinear().domain([0, maxChange]).range(['#82eefd', '#0a1172'])
    // plotting bars
    data.forEach((d, i, n) => {
      svg
        .append('g')
        .attr('id', d.sybmol)
        .selectAll('rect')
        .data([d])
        .join('rect')
        .attr('x', xScale(i) + 20)
        .attr('y', () => {
          if (d.change < 0) {
            return yScale(0)
          } else {
            return yScale(d.change)
          }
        })
        .attr('width', barWidth - 1)
        .attr('height', () => {
          if (d.change < 0) {
            return yScale(d.change) - yScale(0)
          } else {
            return yScale(0) - yScale(d.change)
          }
        })
        .style('fill', () => {
          if (d.change < 0) {
            return colorRed(d.change)
          } else {
            return colorBlue(d.change)
          }
        })
        .on('mouseover', handleOver)
        .on('mouseleave', handleLeave)
    })
  }, [svgWidth, svgHeight])
  return (
    <div ref={svgRef} id='stocks-performance-container'>
      <div id='stocks-performance-header'>
        <h1>Performance of investments</h1>
      </div>
      <hr />
      <div id='stocks-performance-chart'>
        <svg></svg>
      </div>
      <hr />
      <div id='stocks-performance-symbols'>
        {symbol ? (
          <div>
            <p id='selected'>ticker: {symbol}</p>
            <p id='selected'>performance: {change}</p>
            <p id='selected'>location: {location}</p> <p>sector: {industry}</p>
            <p id='selected'>proportion of portfolio: {proportion}</p>
          </div>
        ) : (
          <div>
            <p id='not-selected'>Hover over a bar for more information</p>
          </div>
        )}
      </div>
    </div>
  )
}
export default Performance

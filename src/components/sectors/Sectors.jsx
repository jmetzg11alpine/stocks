import { useState, useEffect, useRef } from 'react'
import data from '../../data/data.json'
import * as d3 from 'd3'
import './styles.css'

const Sectors = () => {
  const [svgWidth, setSvgWidth] = useState(0)
  const [svgHeight, setSvgHeight] = useState(0)

  const svgRef = useRef()
  function getUniqueSectors(data) {
    const sectors = new Set()
    data.forEach((d) => {
      sectors.add(d.sector)
    })
    return sectors
  }
  function getUniqueProportions(data, sector) {
    let sectorGroup = data.filter((data) => data.sector === sector)
    let sum = 0
    sectorGroup.forEach((obj) => {
      sum += obj.proportion
    })
    return { sector: sector, proportionSum: sum }
  }
  const roundUpto = (number, upto) => {
    return Number(number.toFixed(upto))
  }
  function handleOver(e, d) {
    d3.select(this).style('stroke', 'black')
    let stocks = data.filter((data) => data.sector === d.sector)
    d3.select(svgRef.current).select('#stocks-sectors-symbols').selectAll('*').remove()
    let infoSection = d3.select(svgRef.current).select('#stocks-sectors-symbols')
    infoSection
      .append('p')
      .selectAll('text')
      .data([d])
      .join('text')
      .text((d) => d.sector + ' proportion: ' + roundUpto(d.proportionSum * 100, 1) + '% The tickers:')
      .style('font-size', '18')
    infoSection
      .append('div')
      .selectAll('text')
      .data(stocks)
      .join('text')
      .text((d) => d.sybmol)
      .style('font-size', '18')
      .style('font-weight', '400')
  }
  function handleLeave(e, d) {
    d3.select(this).style('stroke', 'none')
    d3.select(svgRef.current).select('#stocks-sectors-symbols').selectAll('*').remove()
    d3.select(svgRef.current).select('#stocks-sectors-symbols').html(`<p>Hover over a slice for more information</p>`)
  }
  useEffect(() => {
    const svg = d3.select(svgRef.current).select('svg')
    svg.selectAll('*').remove()
    setSvgWidth(parseInt(svg.style('width')))
    setSvgHeight(parseInt(svg.style('height')))
    const sectors = getUniqueSectors(data)
    const pieData = []
    sectors.forEach((s) => {
      pieData.push(getUniqueProportions(data, s))
    })
    const CUMSUM = d3.cumsum(pieData, (d) => d.proportionSum)
    pieData.forEach((obj, index) => {
      obj.startAngle = index === 0 ? 0 : CUMSUM[index - 1] * Math.PI * 2
      obj.endAngle = CUMSUM[index] * Math.PI * 2
      obj.innerRadius = (svgWidth / 2) * 0
      obj.outerRadius = (svgWidth / 2) * 0.7
      obj.id = index
    })
    const donutG = svg
      .append('g')
      .attr('id', 'donugG')
      .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`)
    donutG
      .selectAll('path')
      .data(pieData)
      .join('path')
      .attr(
        'd',
        d3
          .arc()
          .innerRadius((d) => d.innerRadius)
          .outerRadius((d) => d.outerRadius)
          .startAngle((d) => d.startAngle)
          .endAngle((d) => d.endAngle)
          .padAngle(0.005)
          .cornerRadius(4)
      )
      .style('fill', (d) => d3.schemeSet3[d.id])
    pieData.forEach((obj, index) => {
      let [x, y] = d3.arc().centroid({
        innerRadius: obj.outerRadius,
        outerRadius: obj.outerRadius,
        startAngle: obj.startAngle,
        endAngle: obj.endAngle,
      })
      donutG
        .append('text')
        .text(obj.sector + ': ' + roundUpto(obj.proportionSum * 100, 1) + '%')
        .attr('x', x)
        .attr('y', y)
        .style('text-anchor', 'middle')
        .style('font-weight', '500')
        .style('font-size', '12')
    })
    donutG.selectAll('path').on('mouseover', handleOver).on('mouseleave', handleLeave)
  }, [svgWidth, svgHeight])
  return (
    <div ref={svgRef} id='stocks-sectors-container'>
      <div id='stocks-sectors-header'>
        <h1>Sector distribution</h1>
      </div>
      <hr />
      <div id='stocks-sectors-chart'>
        <svg></svg>
      </div>
      <hr />
      <div id='stocks-sectors-symbols'>
        <p>Hover over a slice for more information</p>
      </div>
    </div>
  )
}
export default Sectors

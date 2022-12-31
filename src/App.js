import Performance from './components/performance/Performance'
import Sectors from './components/sectors/Sectors'
import Countries from './components/countries/Countries'
import './styles.css'

function App() {
  return (
    <div id='stocks-container-all'>
      <div id='stocks-headers'>
        <p>All this data has come from my personal investment account with Interactive Brokers from the past year. Don't judge too harshly, everyone was a loser in 2022.</p>
      </div>
      <div className='stocks-containers'>
        <div className='stocks-container-one'>
          <Performance />
        </div>
        <div className='stocks-container-two'>
          <Sectors />
        </div>
        <div className='stocks-container-three'>
          <Countries />
        </div>
      </div>
    </div>
  )
}

export default App

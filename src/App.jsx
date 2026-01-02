import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import IdePage from './pages/IdePage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <IdePage></IdePage>
    </>
  )
}

export default App

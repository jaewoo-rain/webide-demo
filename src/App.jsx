
import { Provider } from 'react-redux'
import './App.css'
import IdePage from './pages/IdePage'
import store from './store/store'

function App() {

  return (
    <>
      <Provider store={store}>
        <IdePage></IdePage>
      </Provider>

    </>
  )
}

export default App

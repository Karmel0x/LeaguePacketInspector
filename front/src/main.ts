import './app.css'
import './app2.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app') as HTMLDivElement,
})

export default app

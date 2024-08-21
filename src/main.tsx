import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './home/App'
import Permissions from './permissions/permissions'
import { Profile } from './profile/profile'
import { Spectator } from './spectator/Spectator'

const spectator = new URLSearchParams(window.location.search).get('spectator') === 'true'

const root = createRoot(document.getElementById('root')!)

if (spectator) {
  root.render(
    <Spectator />
  )
} else {
  root.render(
    <Permissions>
      <Profile />
    </Permissions>
  )
}

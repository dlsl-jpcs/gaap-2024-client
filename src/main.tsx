import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './home/App'
import Permissions from './permissions/permissions'
import { Profile } from './profile/profile'

createRoot(document.getElementById('root')!).render(
  <Permissions>
    <Profile />
  </Permissions>
)

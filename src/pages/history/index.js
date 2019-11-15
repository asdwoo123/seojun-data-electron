import React from 'react'

import { Router, AsyncImport } from '../../components'

export default {
  path: '/history',
  component: () => <Router routes={[
    {
      exact: true,
      path: '/history/',
      params: { config: 'home' },
      component: AsyncImport(() => import('./history')),
    }
  ]} />
}

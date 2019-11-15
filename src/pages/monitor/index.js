import React from 'react'

import { Router, AsyncImport } from '../../components'

export default {
  path: '/monitor',
  component: () => <Router routes={[
    {
      exact: true,
      path: '/monitor/',
      params: { key: 'monitor' },
      component: AsyncImport(() => import('./monitor')),
    },
  ]} />,
}

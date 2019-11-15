
import React from 'react'
import { AsyncImport } from '../components'

const routes = [
  { path: '/', component: AsyncImport(() => import('./home')), params: { test: 'ok' } },
];


module.exports = routes;

#!/usr/bin/env node

import createProject from './functions'

/**
 *Create a new project
 */
;(async () => {
  try {
    await createProject()
  } catch (error) {
    console.log(error)
  }
})()

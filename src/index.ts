#!/usr/bin/env node
import { getProjectName } from './projectName.js'
import createProject from './tasks.js'

/**
 * Create a new project
 */
;(async () => {
  const projectName = await getProjectName()

  try {
    await createProject(projectName)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})()

import requireEnvironmentVariables from "require-environment-variables"
import {forEach} from "ramda"
import {head} from "ramda"

import {logger} from "../remote"

import applicable from "./applicable"
import processLense from "./processLense"

requireEnvironmentVariables([
  "GOOGLE_CLOUD_STORAGE_BUCKET",
])

logger.info("Starting worker")

process.on("message", function receiveMessage ({id, lenses}: {id: string, lenses: Array<string>}) {
  forEach(processLense(id), applicable(lenses))
})

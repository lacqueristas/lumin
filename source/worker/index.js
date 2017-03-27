import requireEnvironmentVariables from "require-environment-variables"
import {pipe} from "ramda"
import {reduce} from "ramda"
import {forEach} from "ramda"
import gm from "gm"

import {zmqPullClient} from "../remote"
import {logger} from "../remote"
import {googleCloudStorage} from "../remote"

import applicable from "./applicable"
import apply from "./apply"

requireEnvironmentVariables([
  "GOOGLE_CLOUD_STORAGE_BUCKET",
])

const googleStorageBucket = googleCloudStorage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET)

logger.info("Starting worker...")

zmqPullClient()
  .on("message", pipe(JSON.parse, ([id, names]) => {
    const from = googleStorageBucket.file(`raw/${id}`).createReadStream()

    const applicableLenses = applicable(names)

    forEach(function processLenses ({name, pipeline}: LenseType) {
      const magickClient = gm(from)
      const chain = apply(pipeline)
      const to = googleStorageBucket.file(`processed/${id}/${name}`).createWriteStream({
        "gzip": true,
        "cacheControl": "public, max-age=31556926",
        "resumable": false,
        "private": false,
      })

      reduce((previous: any, current: Function): any => current(previous), magickClient, chain)
       .stream()
       .on("error", logger.error)
       .on("end", () => {
         logger.info(`Finished processing ${id}/${name}`)
       })
       .pipe(to)
    }, applicableLenses)
  }))
  .on("error", logger.error)

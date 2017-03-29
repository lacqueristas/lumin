import {PassThrough} from "stream"
import requireEnvironmentVariables from "require-environment-variables"
import {pipe} from "ramda"
import {reduce} from "ramda"
import {forEach} from "ramda"
import magick from "gm"
import fileTypeStream from "file-type-stream"

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
  .on("message", pipe(JSON.parse, ([id, names]: [string, string]) => {
    const from = googleStorageBucket
      .file(`raw/${id}`)
      .createReadStream()
    const graphicsMagick = magick(from)
    const applicableLenses = applicable(names)

    forEach(function processLenses ({name, pipeline}: LenseType) {
      const bridge = new PassThrough()

      reduce((previous: any, current: Function): any => current(previous), graphicsMagick, apply(pipeline))
       .stream()
       .on("error", logger.error.bind(logger))
       .on("end", (): any => logger.info(`Finished processing ${id}/${name}`))
       .pipe(
         fileTypeStream(({mime}: {mime: string}) => {
           bridge.pipe(
             googleStorageBucket
               .file(`processed/${id}/${name}`)
               .createWriteStream({
                 "gzip": true,
                 "resumable": false,
                 "private": false,
                 "public": true,
                 "metadata": {
                   cacheControl: "public, max-age=31556926",
                   contentType: mime,
                 },
               })
           )
         })
       )
       .pipe(bridge)
    }, applicableLenses)
  }))
  .on("error", logger.error.bind(logger))

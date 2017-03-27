/* eslint-disable import/max-dependencies */
import {join} from "path"
import requireEnvironmentVariables from "require-environment-variables"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import compression from "compression"
import uuid from "uuid/v4"
import {created} from "httpstatuses"
import {split} from "ramda"
import {zipObj} from "ramda"
import {map} from "ramda"

import {logger} from "../remote"
import {googleCloudStorage} from "../remote"
import {zmqPushClient} from "../remote"

requireEnvironmentVariables([
  "PORT",
  "NODE_ENV",
  "GOOGLE_CLOUD_STORAGE_BUCKET",
])

const GOOGLE_CLOUD_URI = "https://storage.googleapis.com"
const googleStorageBucket = googleCloudStorage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET)

const application = express()

application.use(cors())
application.use(morgan("dev"))
application.use(compression())
application.use(express.static(join(__dirname, "public")))

application.post("/images", function createImage (request: any, response: any): any {
  const id = uuid()
  const lenses = split(",", request.query.lenses || "original")

  return request
    .pipe(googleStorageBucket.file(`raw/${id}`).createWriteStream({
      "gzip": true,
      "cacheControl": "public, max-age=31556926",
      "resumable": false,
      "private": true,
    }))
    .on("error", logger.error)
    .on("finish", (): any => {
      zmqPushClient().send(JSON.stringify([id, lenses]))

      return response
        .status(created)
        .links(zipObj(lenses, map((lense: string): string => `${process.env.LUMIN_LOCATION}/images/${id}/${lense}`, lenses)))
        .end()
    })
})

application.get("/images/:id", function showImage (request: any, response: any): any {
  return response.redirect(`${GOOGLE_CLOUD_URI}/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/processed/${request.params.id}`)
})


application.listen(
  process.env.PORT,
  (): any => logger.info(`Listening to ${process.env.PORT}`)
)

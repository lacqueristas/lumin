/* eslint-disable import/max-dependencies */
import {join} from "path"
import requireEnvironmentVariables from "require-environment-variables"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import compression from "compression"
import uuid from "uuid/v4"
import {created} from "httpstatuses"

import {logger} from "./remote"
import {googleCloudStorage} from "./remote"

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

application.post("/images", function postImages (request: any, response: any): any {
  const id = uuid()

  return request
    .pipe(googleStorageBucket.file(`raws/${id}`).createWriteStream({
      "gzip": true,
      "cacheControl": "public, max-age=31556926",
      "resumable": false,
      "private": true,
    }))
    .on("error", logger.error)
    .on("finish", (): any => response
      .status(created)
      .location(`/images/${id}`)
      .end()
    )
})

application.get("/images/:id", function getImage (request: any, response: any): any {
  return response.redirect(`${GOOGLE_CLOUD_URI}/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/processed/${request.params.id}`)
})

application.listen(
  process.env.PORT,
  (): any => logger.info(`Listening to ${process.env.PORT}`)
)

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
import mapValues from "@unction/mapvalues"

import {logger} from "../remote"
import {googleCloudStorage} from "../remote"

requireEnvironmentVariables([
  "PORT",
  "NODE_ENV",
  "GOOGLE_CLOUD_STORAGE_BUCKET",
])

const GOOGLE_CLOUD_URI = "https://storage.googleapis.com"
const googleStorageBucket = googleCloudStorage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET)

const application = express()

application.use(cors({exposedHeaders: ["Link", "Content-Type"]}))
application.use(morgan("dev"))
application.use(compression())
application.use(express.static(join(__dirname, "public")))

application.options("*", cors({exposedHeaders: ["Link", "Content-Type"]}))

application.post("/images", function createImage (request: any, response: any): any {
  const id = uuid()
  const lenses = split(",", request.query.lenses || "original")

  const to = googleStorageBucket
    .file(`raw/${id}`)
    .createWriteStream({
      "gzip": true,
      "cacheControl": "public, max-age=31556926",
      "resumable": false,
      "private": true,
    })

  return request
    .pipe(to)
    .on("error", logger.error.bind(logger))
    .on("finish", () => {
      process.send({
        id,
        lenses,
      })
    })
    .on("finish", () => {
      response
        .status(created)
        .links(zipObj(lenses, mapValues((lense: string): string => `${process.env.LUMIN_LOCATION}/images/${id}/${lense}`)(lenses)))
        .end()
    })
})

application.get("/images/:id/:lense", function showImage (request: any, response: any): any {
  return response.redirect(`${GOOGLE_CLOUD_URI}/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/processed/${request.params.id}/${request.params.lense}`)
})


application.listen(
  process.env.PORT,
  (): any => logger.info(`Listening to ${process.env.PORT}`)
)

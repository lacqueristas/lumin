import {PassThrough} from "stream"
import requireEnvironmentVariables from "require-environment-variables"
import {pipe} from "ramda"
import {reduce} from "ramda"
import {forEach} from "ramda"
import magick from "gm"
import fileTypeStream from "file-type-stream"

import {logger} from "../remote"
import {googleCloudStorage} from "../remote"

import applicable from "./applicable"
import apply from "./apply"

requireEnvironmentVariables([
  "GOOGLE_CLOUD_STORAGE_BUCKET",
])

const googleStorageBucket = googleCloudStorage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET)

logger.info("Starting worker...")

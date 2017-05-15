import {PassThrough} from "stream"
import magick from "gm"
import fileTypeStream from "file-type-stream"
import reduceValues from "@unction/reducevalues"

import {googleCloudStorage} from "../../remote"
import {logger} from "../../remote"
import apply from "./apply"

const googleStorageBucket = googleCloudStorage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET)

export default function processLense (id: string): Function {
  const from = googleStorageBucket
    .file(`raw/${id}`)
    .createReadStream()
  const graphicsMagick = magick(from)

  return function processLenseId ({name, pipeline}: LenseType) {
    const bridge = new PassThrough()

    reduceValues((previous: any): Function => (current: Function): any => current(previous))(graphicsMagick)(apply(pipeline))
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
  }
}

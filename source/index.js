import {fork} from "child_process"
import {join} from "path"

import {logger} from "./remote"

const server = fork(join(__dirname, "server", "index.js"))
const worker = fork(join(__dirname, "worker", "index.js"))

logger.info("Starting parent")

process.on("close", function close () {
  logger.info("Closing")
  server.kill()
  worker.kill()
})

server.on("message", function receiveServerMessage (message: any) {
  worker.send(message)
})

worker.on("message", function receiveWorkerMessage (message: any) {
  server.send(message)
})

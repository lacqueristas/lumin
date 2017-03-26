import {socket} from "zeromq"

export default function zmqPushClient (): any {
  return socket("push").bindSync("tcp://127.0.0.1:9001")
}

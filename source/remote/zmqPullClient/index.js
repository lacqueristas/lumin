import {socket} from "zeromq"

export default function zmqPullClient (): any {
  return socket("pull").connect("tcp://127.0.0.1:9001")
}

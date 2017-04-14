import {invoker} from "ramda"

export default function prepareInvokation ([unction, ...rguments]: [Function]): Function {
  return invoker(rguments.length, unction)(...rguments)
}

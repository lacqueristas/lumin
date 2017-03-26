import {map} from "ramda"
import {invoker} from "ramda"

export default function apply (pipeline: Array<MutationType>): Array<Function> {
  return map(function prepareInvokation ([unction, ...rguments]): Function {
    return invoker(rguments.length, unction)(...rguments)
  }, pipeline)
}

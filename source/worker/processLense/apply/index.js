import mapValues from "@unction/mapvalues"

import prepareInvokation from "./prepareInvokation"

const prepareInvokations = mapValues(prepareInvokation)

export default function apply (pipeline: Array<MutationType>): Array<Function> {
  return prepareInvokations(pipeline)
}

import {map} from "ramda"

import prepareInvokation from "./prepareInvokation"

const prepareInvokations = map(prepareInvokation)

export default function apply (pipeline: Array<MutationType>): Array<Function> {
  return prepareInvokations(pipeline)
}

import mapValues from "@unction/mapvalues"
import compact from "@unction/compact"

import lenses from "./lenses"
import findLenseByName from "./findLenseByName"

const findLenseByNames = mapValues(findLenseByName(lenses))

export default function applicable (names: Array<string>): Array<LenseType> {
  return compact(findLenseByNames(names))
}

import {map} from "ramda"
import compact from "@unction/compact"

import lenses from "./lenses"
import findLenseByName from "./findLenseByName"

const findLenseByNames = map(findLenseByName(lenses))

export default function applicable (names: Array<string>): Array<LenseType> {
  return compact(findLenseByNames(names))
}

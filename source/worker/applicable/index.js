import {map} from "ramda"
import {compact} from "ramda-extra"

import lenses from "./lenses"
import findLenseByName from "./findLenseByName"

const findLenseByNames = map(findLenseByName(lenses))

export default function applicable (names: Array<string>): Array<LenseType> {
  return compact(findLenseByNames(names))
}

import {find} from "ramda"
import {whereEq} from "ramda"
import {map} from "ramda"
import {compact} from "ramda-extra"

import lenses from "./lenses"

export default function applicable (names: Array<string>): Array<LenseType> {
  return compact(map(function findLenseByName (name: string): LenseType {
    return find(whereEq({name}), lenses)
  }, names))
}

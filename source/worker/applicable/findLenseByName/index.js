import {find} from "ramda"
import {whereEq} from "ramda"

export default function findLenseByName (lenses: Array<string>): Function {
  return function findLenseByNameLenses (name: string): LenseType {
    return find(whereEq({name}), lenses)
  }
}

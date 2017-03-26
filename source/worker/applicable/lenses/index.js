import {readFileSync} from "fs"
import {prop} from "ramda"

export default prop("lenses", JSON.parse(readFileSync("./data/lenses.json")))

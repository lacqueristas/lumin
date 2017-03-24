import storage from "@google-cloud/storage"
import requireEnvironmentVariables from "require-environment-variables"

requireEnvironmentVariables([
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_CLOUD_KEY_FILENAME",
])

export default storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME,
})

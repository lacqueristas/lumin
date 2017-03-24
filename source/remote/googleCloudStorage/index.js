import storage from "@google-cloud/storage"
import requireEnvironmentVariables from "require-environment-variables"

requireEnvironmentVariables([
  "GOOGLE_CLOUD_PROJECT_ID",
  "GOOGLE_CLOUD_KEY_FILENAME",
])

export default storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME,
})

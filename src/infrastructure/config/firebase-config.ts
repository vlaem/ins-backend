export function getProjectId() {
  return process.env.FIREBASE_PROJECT_ID as string
}

export function getClientEmail() {
  return process.env.FIREBASE_CLIENT_EMAIL as string
}

export function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY as string
}

export function getApiKey() {
  return process.env.FIREBASE_API_KEY as string
}

export function getAuthDomain() {
  return process.env.FIREBASE_AUTH_DOMAIN as string
}

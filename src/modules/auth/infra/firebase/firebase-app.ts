import { Config } from '#config'
import { cert } from 'firebase-admin/app'
import admin from 'firebase-admin'

function initialize() {
  if (
    Config.Firebase.ProjectId &&
    Config.Firebase.ClientEmail &&
    Config.Firebase.PrivateKey &&
    Config.Firebase.ApiKey &&
    Config.Firebase.AuthDomain
  ) {
    return admin.initializeApp({
      credential: cert({
        projectId: Config.Firebase.ProjectId,
        clientEmail: Config.Firebase.ClientEmail,
        privateKey: Config.Firebase.PrivateKey,
      }),
      projectId: Config.Firebase.ProjectId,
    })
  }
}

export const FirebaseAdminApp = initialize()

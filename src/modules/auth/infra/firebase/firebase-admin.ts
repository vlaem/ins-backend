import { Logger } from '#logger'
import { Config } from '#config'
import { app as FirebaseApp } from 'firebase-admin'
import { InvalidOperationError } from '#errors'
import { DecodedIdToken } from 'firebase-admin/auth'
import admin from 'firebase-admin'
import { cert } from 'firebase-admin/app'

export class FirebaseAdmin {
  private firebaseAdminApp: FirebaseApp.App | undefined
  private logger: Logger
  constructor(logger: Logger, config: Config) {
    this.logger = logger

    if (
      config.Firebase.projectId &&
      config.Firebase.clientEmail &&
      config.Firebase.privateKey
    ) {
      this.firebaseAdminApp = admin.initializeApp({
        credential: cert({
          projectId: config.Firebase.projectId,
          clientEmail: config.Firebase.clientEmail,
          privateKey: config.Firebase.privateKey,
        }),
        projectId: config.Firebase.projectId,
      })
    }
  }

  async decodeToken(token: string) {
    if (!this.firebaseAdminApp) {
      throw new InvalidOperationError('FIREBASE_ADMIN_NOT_SUPPORTED')
    }

    let decodedToken: DecodedIdToken

    try {
      decodedToken = await this.firebaseAdminApp.auth().verifyIdToken(token)
    } catch (error: any) {
      this.logger.error(error)
      throw new InvalidOperationError('INVALID_FIREBASE_TOKEN')
    }

    this.logger.debug('Decoded Firebase Token', decodedToken)

    if (!decodedToken.uid || !decodedToken.email) {
      throw new InvalidOperationError('INVALID_FIREBASE_TOKEN')
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }
  }
}

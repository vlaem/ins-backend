import { FirebaseAdminApp } from './firebase-app'
import logger from '#logger'
import { InvalidOperationError } from '#errors'
import { DecodedIdToken } from 'firebase-admin/auth'

export async function decodeToken(token: string) {
  if (!FirebaseAdminApp) {
    throw new InvalidOperationError(
      'FIREBASE_ADMIN_NOT_SUPPORTED',
      'This server does not currently support firebase operations.'
    )
  }

  let decodedToken: DecodedIdToken

  try {
    decodedToken = await FirebaseAdminApp.auth().verifyIdToken(token)
  } catch (error: any) {
    logger.error(error)
    throw new InvalidOperationError(
      'INVALID_FIREBASE_TOKEN',
      'The provided token is invalid.'
    )
  }

  logger.debug('Decoded Firebase Token', decodedToken)

  if (!decodedToken.uid || !decodedToken.email) {
    throw new InvalidOperationError(
      'INVALID_FIREBASE_TOKEN',
      'The provided token is invalid.'
    )
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
  }
}

import * as FirebaseConfig from '~config/firebase-config'
import { InvalidOperationError } from '~errors'
import admin from 'firebase-admin'
import { cert } from 'firebase-admin/app'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

// TODO: This should be functional
class FirebaseAdminAppSingleton {
  private static instance: FirebaseAdminAppSingleton

  private constructor() {
    this._app = admin.initializeApp({
      credential: cert({
        projectId: FirebaseConfig.getProjectId(),
        clientEmail: FirebaseConfig.getClientEmail(),
        privateKey: FirebaseConfig.getPrivateKey(),
      }),
      projectId: FirebaseConfig.getProjectId(),
    })
  }
  public static getInstance(): FirebaseAdminAppSingleton {
    if (!FirebaseAdminAppSingleton.instance) {
      FirebaseAdminAppSingleton.instance = new FirebaseAdminAppSingleton()
    }

    return FirebaseAdminAppSingleton.instance
  }
  private _app: admin.app.App

  public get app(): admin.app.App {
    return this._app
  }
}

export interface FirebaseDecodedUserData {
  uid: string
  email: string
}

const verifyIdToken = (idToken: string) =>
  TE.tryCatch(
    () =>
      FirebaseAdminAppSingleton.getInstance().app.auth().verifyIdToken(idToken),
    () => InvalidOperationError.of('INVALID_FIREBASE_TOKEN')
  )

const toFirebaseDecodedUserData = (
  x: admin.auth.DecodedIdToken
): FirebaseDecodedUserData => ({
  uid: x.uid,
  email: x.email as string,
})

export const decodeFirebaseToken = (idToken: string) =>
  pipe(
    idToken,
    verifyIdToken,
    TE.flatMap((x) =>
      x.email
        ? pipe(x, toFirebaseDecodedUserData, TE.right)
        : pipe('INVALID_FIREBASE_TOKEN', InvalidOperationError.of, TE.left)
    )
  )

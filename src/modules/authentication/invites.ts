import * as InviteRepo from '~/infrastructure/repositories/invite-repository'
import * as UserRepo from '~/infrastructure/repositories/user-repository'
import * as UserRefreshTokenRepo from '~/infrastructure/repositories/user-refresh-token-repository'
import { transaction } from '~/infrastructure/repositories/transaction'
import {
  ResourceNotFoundError,
  InvalidOperationError,
  ExtendedHonoError,
} from '~errors'
import * as TE from 'fp-ts/TaskEither'
import * as TO from 'fp-ts/TaskOption'
import * as I from 'fp-ts/Identity'
import { DateTime } from 'luxon'
import { pipe } from 'fp-ts/function'
import {
  decodeFirebaseToken,
  FirebaseDecodedUserData,
} from './firebase/firebase-admin'
import { User } from '~domain/models/user'
import { Invite } from '~domain/models/invite'
import { createRefreshTokenForUser } from '~domain/models/user-refresh-token'
import { encodeAccessToken, generateAuthTokenPayload } from './access-token'

interface InviteView {
  id: string
}

const findInviteNonExpiredById = (
  inviteCode: string
): TE.TaskEither<ExtendedHonoError, Invite> =>
  pipe(
    inviteCode,
    InviteRepo.findNonExpiredById,
    TE.fromTaskOption(() =>
      ResourceNotFoundError.of('INVITE_NOT_FOUND_OR_EXPIRED')
    )
  )

export const findValidInvite = (inviteCode: string) =>
  pipe(
    inviteCode,
    findInviteNonExpiredById,
    TE.map(
      (invite) =>
        ({
          id: invite.id,
        }) as InviteView
    )
  )

const checkEmailAvailability = (email: string) =>
  pipe(
    email,
    UserRepo.findByEmail,
    TO.match(
      () => TE.right(email),
      () => TE.left(InvalidOperationError.of('EMAIL_ALREADY_IN_USE'))
    ),
    TE.fromTask,
    TE.flatten
  )

const fromDecodedFirebaseTokenToUser = (
  decodedUserData: FirebaseDecodedUserData
): User =>
  pipe(decodedUserData, (x) => ({
    id: x.uid,
    email: x.email,
    firebaseUid: x.uid,
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
  }))

const createUserFromFirebaseToken = (
  firebaseToken: string
): TE.TaskEither<ExtendedHonoError, User> =>
  pipe(
    firebaseToken,
    decodeFirebaseToken,
    TE.tap((x) => pipe(x.email, checkEmailAvailability)),
    TE.map(fromDecodedFirebaseTokenToUser)
  )

export const reedeemInviteWithFirebaseToken =
  (inviteCode: string) => (firebaseToken: string) =>
    pipe(
      TE.Do,
      TE.bind('invite', () => pipe(inviteCode, findInviteNonExpiredById)),
      TE.bind('user', () => pipe(firebaseToken, createUserFromFirebaseToken)),
      TE.bindW('userRefreshToken', ({ user }) =>
        pipe(user, createRefreshTokenForUser, TE.fromTask)
      ),
      TE.bindW('accessTokenGroup', ({ user }) =>
        pipe(user, encodeAccessToken, TE.of)
      ),
      TE.tap(({ invite, userRefreshToken, user }) =>
        transaction(() =>
          pipe(
            UserRepo.save(user),
            InviteRepo.destroy(invite),
            UserRefreshTokenRepo.save(userRefreshToken)
          )
        )
      ),
      TE.map(({ userRefreshToken, accessTokenGroup }) =>
        pipe(
          generateAuthTokenPayload,
          I.ap(accessTokenGroup),
          I.ap(userRefreshToken)
        )
      )
    )

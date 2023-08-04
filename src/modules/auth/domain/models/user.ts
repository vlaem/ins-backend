import { v4 as uuidv4 } from 'uuid'

interface UserModelData {
  id: string
  email: string
  password: string
}

export class User {
  static createWithEmailAndPassword(email: string, password: string): User {
    const user = new User()

    user._id = uuidv4()
    user._email = email
    user._password = password

    return user
  }

  static createWithFirebaseUid(email: string, firebaseUid: string): User {
    const user = new User()

    user._id = uuidv4()
    user._email = email
    user._firebaseUid = firebaseUid

    return user
  }

  /**
   * This method should only be used by the repository to load data from the database.
   * @param data: IUser
   * @returns {User}
   */
  static load(data: UserModelData): User {
    const user = new User()

    user._id = data.id
    user._email = data.email
    user._password = data.password

    return user
  }

  private constructor() {}

  private _id: string = ''
  get id(): string {
    return this._id
  }

  private _email: string = ''
  get email(): string {
    return this._email
  }

  private _password: string = ''
  get password(): string {
    return this._password
  }

  private _firebaseUid: string = ''
  get firebaseUid(): string {
    return this._firebaseUid
  }
}

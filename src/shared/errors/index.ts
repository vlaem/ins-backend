/**
 * A base error that has a code and a message. Developers will rarely use this directly, but will use one of the subclasses
 */
export class CodedError extends Error {
  code: string

  constructor(message?: string, code?: string) {
    super(message)
    this.name = 'CodedError'
    this.code = code ?? 'UNKNOWN_CODE'
  }
}

/**
 * A resource is forbidden for the current user, for example, a user trying to access another user's data. This should be reported to the user as a 403 error.
 */
export class ForbiddenError extends CodedError {
  constructor(message?: string) {
    super(message)
    this.name = 'ForbiddenError'
    this.code = 'FORBIDDEN_ERROR'
  }
}

/**
 * The current user is not authorized to perform the current operation. In particular, there is no Authorization header. This should be reported to the user as a 401 error.
 */
export class UnauthorizedError extends CodedError {
  constructor(message?: string) {
    super(message)
    this.name = 'UnauthorizedError'
    this.code = 'UNAUTHORIZED_ERROR'
  }
}

/**
 * A resource was not found. This should be reported to the user as a 404 error.
 */
export class ResourceNotFoundError extends CodedError {
  constructor(message?: string, code?: string) {
    super(message, code)
    this.name = 'ResourceNotFoundError'
  }
}

/**
 * The current operation is invalid, due to some rules in the code. This should be reported to the user as a 400 error.
 */
export class InvalidOperationError extends CodedError {
  constructor(message?: string, code?: string) {
    super(message, code ?? 'INVALID_OPERATION_ERROR')
    this.name = 'InvalidOperationError'
  }
}

/**
 * A system error occurred, most likely due to a bug in the code rather than an user input error or failed business rule. This should be reported as a 500 error and highlighted in the logs
 */
export class SystemError extends CodedError {
  constructor(message?: string, code?: string) {
    super(message, code ?? 'SYSTEM_ERROR')
    this.name = 'SystemError'
  }
}

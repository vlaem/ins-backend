import { HTTPException } from 'hono/http-exception'

export class ExtendedHTTPException extends HTTPException {
  code: string
  constructor(status: number, code: string) {
    super(status)
    this.code = code
  }
}

/**
 * A resource is forbidden for the current user, for example, a user trying to access another user's data. This should be reported to the user as a 403 error.
 */
export class ForbiddenError extends ExtendedHTTPException {
  constructor() {
    super(403, 'FORBIDDEN_ERROR')
    this.name = 'ForbiddenError'
  }
}

/**
 * The current user is not authorized to perform the current operation. In particular, there is no Authorization header. This should be reported to the user as a 401 error.
 */
export class UnauthorizedError extends ExtendedHTTPException {
  constructor() {
    super(401, 'UNAUTHORIZED_ERROR')
    this.name = 'UnauthorizedError'
  }
}

/**
 * A resource was not found. This should be reported to the user as a 404 error.
 */
export class ResourceNotFoundError extends ExtendedHTTPException {
  constructor(code?: string) {
    super(404, code ?? 'RESOURCE_NOT_FOUND_ERROR')
    this.name = 'UnauthorizedError'
  }
}

/**
 * The current operation is invalid, due to some rules in the code. This should be reported to the user as a 400 error.
 */
export class InvalidOperationError extends ExtendedHTTPException {
  constructor(code?: string) {
    super(400, code ?? 'INVALID_OPERATION_ERROR')
    this.name = 'InvalidOperationError'
  }
}

/**
 * A system error occurred, most likely due to a bug in the code rather than an user input error or failed business rule. This should be reported as a 500 error and highlighted in the logs
 */
export class SystemError extends ExtendedHTTPException {
  constructor(code?: string) {
    super(500, code ?? 'SYSTEM_ERROR')
    this.name = 'SystemError'
  }
}

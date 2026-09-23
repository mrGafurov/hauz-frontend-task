import { createServerFn } from '@tanstack/react-start'
import { ExecutionMethod } from 'node-appwrite'
import { z } from 'zod'

import { createSessionFunctions } from '../../server/appwrite'
import {
  clearSessionSecret,
  getSessionSecret,
} from '../../server/session'

const FUNCTION_ID = 'personal-account'

const roleSchema = z.enum(['property_owner', 'realtor'])

const personalAccountSchema = z.object({
  personalAccountId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: roleSchema,
  contactEmail: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const createAccountInput = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: roleSchema,
})

type PersonalAccount = z.infer<typeof personalAccountSchema>

interface FunctionRequest {
  method: ExecutionMethod
  body?: unknown
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function getErrorMessage(responseBody: string): string {
  const parsed = parseJson(responseBody)

  if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
    const message = parsed.message

    if (typeof message === 'string') {
      return message
    }
  }

  return 'The personal account request failed.'
}

async function executePersonalAccount<T>(
  request: FunctionRequest,
  schema: z.ZodType<T>,
): Promise<{ status: number; data: T | null }> {
  const sessionSecret = getSessionSecret()

  if (!sessionSecret) {
    return { status: 401, data: null }
  }

  const execution = await createSessionFunctions(sessionSecret).createExecution(
    {
      functionId: FUNCTION_ID,
      xpath: '/personal-account',
      method: request.method,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      headers: { 'content-type': 'application/json' },
      async: false,
    },
  )

  if (execution.responseStatusCode >= 400 && execution.responseStatusCode !== 404) {
    if (execution.responseStatusCode === 401) {
      clearSessionSecret()
    }

    throw new Error(getErrorMessage(execution.responseBody))
  }

  if (execution.responseStatusCode === 404) {
    return { status: 404, data: null }
  }

  return {
    status: execution.responseStatusCode,
    data: schema.parse(parseJson(execution.responseBody)),
  }
}

export const getPersonalAccount = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PersonalAccount | null> => {
    const result = await executePersonalAccount(
      { method: ExecutionMethod.GET },
      personalAccountSchema,
    )

    if (result.status === 401 || result.status === 404) {
      return null
    }

    return result.data
  },
)

export const createPersonalAccount = createServerFn({ method: 'POST' })
  .validator(createAccountInput)
  .handler(async ({ data }): Promise<PersonalAccount> => {
    const result = await executePersonalAccount(
      { method: ExecutionMethod.POST, body: data },
      personalAccountSchema,
    )

    if (!result.data) {
      throw new Error('Could not create the personal account.')
    }

    return result.data
  })

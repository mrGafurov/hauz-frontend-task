import { Account, Client } from 'node-appwrite'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required on the server.`)
  }

  return value
}

function createClient(): Client {
  return new Client()
    .setEndpoint(getRequiredEnv('APPWRITE_ENDPOINT'))
    .setProject(getRequiredEnv('APPWRITE_PROJECT_ID'))
}

export function createSessionAccount(sessionSecret: string): Account {
  return new Account(createClient().setSession(sessionSecret))
}

export function createAdminAccount(): Account {
  return new Account(
    createClient().setKey(getRequiredEnv('APPWRITE_API_KEY')),
  )
}

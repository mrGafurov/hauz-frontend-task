export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AppwriteUserIdentity {
  $id: string
  email: string
  name: string
}

export function toAuthUser(user: AppwriteUserIdentity): AuthUser {
  return {
    id: user.$id,
    email: user.email,
    name: user.name,
  }
}

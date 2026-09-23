import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import { SiteHeader } from '../components/site-header'
import { getCurrentUser } from '../features/auth/auth.functions'
import { getPersonalAccount } from '../features/personal-account/personal-account.functions'
import appCss from '../styles.css?url'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HAUZ' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  loader: async () => {
    const user = await getCurrentUser()

    if (!user) {
      return null
    }

    const personalAccount = await getPersonalAccount()

    return personalAccount ? { ...user, name: personalAccount.firstName } : user
  },
  errorComponent: RootError,
  shellComponent: RootDocument,
})

function RootError() {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>We could not load this page. Please try again or sign in again.</p>
      <p>
        <Link to="/">Try again</Link>{' '}
        <Link to="/sign-in">Sign in</Link>
      </p>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const user = Route.useLoaderData()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="app-frame">
          <SiteHeader user={user} />
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  )
}

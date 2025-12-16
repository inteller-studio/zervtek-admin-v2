import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { type Role } from '@/lib/rbac/types'
import { AUTH_CONSTANTS } from '@/lib/constants'

const { ACCESS_TOKEN_COOKIE: ACCESS_TOKEN, USER_DATA_COOKIE } = AUTH_CONSTANTS

export interface AuthUser {
  accountNo: string
  email: string
  role: Role[]
  exp: number
  firstName?: string
  lastName?: string
  id?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''

  // Try to restore user from cookie
  const userCookie = getCookie(USER_DATA_COOKIE)
  let initUser: AuthUser | null = null
  if (userCookie) {
    try {
      initUser = JSON.parse(userCookie)
    } catch {
      initUser = null
    }
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          // Sync user data to cookie for middleware access
          if (user) {
            setCookie(USER_DATA_COOKIE, JSON.stringify(user))
          } else {
            removeCookie(USER_DATA_COOKIE)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(USER_DATA_COOKIE)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)
  const [authNotification, setAuthNotification] = useState(null)

  useEffect(() => {
    let isMounted = true

    // Check if current URL contains recovery token or hash
    const checkHashForRecovery = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || ''
        const search = window.location.search || ''
        if (hash.includes('type=recovery') || search.includes('type=recovery')) {
          if (isMounted) setIsRecovery(true)
        }
      }
    }

    checkHashForRecovery()

    // 1. Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (error) {
          console.warn('Error fetching Supabase session:', error.message)
        }
        if (isMounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.warn('Failed to retrieve session:', err)
        if (isMounted) setLoading(false)
      })

    // 2. Listen for auth changes (sign in, sign out, token refresh, password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return

      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      } else if (event === 'SIGNED_OUT') {
        setIsRecovery(false)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Sign up with full name, email, password
  const signUp = async ({ fullName, email, password }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Sign in with email and password
  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      setIsRecovery(false)
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  // Request password reset email
  const resetPasswordForEmail = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Update password (for password recovery or user settings)
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setIsRecovery(false)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const value = {
    user,
    session,
    loading,
    isRecovery,
    setIsRecovery,
    authNotification,
    setAuthNotification,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

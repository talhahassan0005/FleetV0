import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { JWTPayload } from '@/lib/jwt-utils'

interface AuthState {
  user: JWTPayload | null
  accessToken: string | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isInitialized: false,
  error: null,
}

export const initSession = createAsyncThunk<
  { user: JWTPayload | null; accessToken: string },
  void,
  { rejectValue: string }
>('auth/initSession', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })
    if (!res.ok) return rejectWithValue('No session')

    const data = await res.json()
    return { user: data.user ?? null, accessToken: data.accessToken || 'cookie' }
  } catch {
    return rejectWithValue('Session init failed')
  }
})

export const loginUser = createAsyncThunk<
  { user: JWTPayload | null; accessToken: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/jwt-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as { error?: string }))
      return rejectWithValue(err.error || 'Login failed')
    }

    const data = await res.json()
    return { user: data.user ?? null, accessToken: data.accessToken || 'cookie' }
  } catch {
    return rejectWithValue('Network error')
  }
})

export const refreshToken = createAsyncThunk<
  { accessToken: string },
  void,
  { rejectValue: string }
>('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/jwt-refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) return rejectWithValue('Refresh failed')

    const data = await res.json()
    return { accessToken: data.accessToken || 'cookie' }
  } catch {
    return rejectWithValue('Network error')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null
      state.accessToken = null
      state.isLoading = false
      state.error = null
    },
    setUser(state, action: PayloadAction<JWTPayload | null>) {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // initSession
      .addCase(initSession.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isLoading = false
        state.isInitialized = true
        state.error = null
      })
      .addCase(initSession.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.isLoading = false
        state.isInitialized = true
        state.error = null
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isLoading = false
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) ?? 'Login failed'
      })

      // refreshToken
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null
        state.accessToken = null
      })
  },
})

export const { clearAuth, setUser } = authSlice.actions
export default authSlice.reducer

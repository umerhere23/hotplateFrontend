import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
  token: string | null
  tokenType: string | null
}

const initialState: AuthState = {
  token: null,
  tokenType: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; tokenType?: string }>) {
      state.token = action.payload.token
      state.tokenType = action.payload.tokenType ?? 'Bearer'
    },
    clearAuth(state) {
      state.token = null
      state.tokenType = null
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

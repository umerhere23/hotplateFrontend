import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type User = {
  id: string | number
  name?: string
  email?: string
  phone?: string
  avatarUrl?: string
  [key: string]: any
}

type UserState = {
  currentUser: User | null
}

const initialState: UserState = {
  currentUser: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
      }
    },
    clearUser(state) {
      state.currentUser = null
    },
  },
})

export const { setUser, updateUser, clearUser } = userSlice.actions
export default userSlice.reducer

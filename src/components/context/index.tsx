"use client"
import React, { createContext, useContext, useReducer, ReactNode } from "react"

interface AppState {
  isMenuOpen: boolean
}

const initialState: AppState = {
  isMenuOpen: false,
}

type Action = { type: "SET_MENU"; payload: boolean }

function appStateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_MENU":
      return { ...state, isMenuOpen: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
}>({
  state: initialState,
  dispatch: () => null,
})

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)

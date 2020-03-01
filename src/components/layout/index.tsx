import * as React from "react"
import { ThemeManagerContext } from "gatsby-styled-components-dark-mode"
import { createGlobalStyle, withTheme } from "styled-components"
import Header from "../header"

const GlobalStyle = createGlobalStyle`
  body {
    background: ${props => props.theme.colors.background};
    transition: ${props => props.theme.easing.background};
  }
`

export default withTheme(props => {
  const { children, theme } = props;
  return (
    <>
      <GlobalStyle theme={theme} />
      {children}
    </>
  )
})

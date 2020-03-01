import * as React from "react"
import Icon from "../icon"
import { BasicButton, PrimaryButton, ButtonDetail } from "./styled-components"
import { ThemeManagerContext } from "gatsby-styled-components-dark-mode"

interface IconButtonProps {
  icon: String
  setIsDarkMode: Function
  isDarkMode: Boolean
}

export const IconButton = (props: IconButtonProps) => (
  <BasicButton onClick={() => props.setIsDarkMode()}>
    <Icon icon={props.icon} />
  </BasicButton>
)

export const CallToActionButton = () => {
  const themeContext = React.useContext(ThemeManagerContext)

  return (
    <BasicButton style={{ margin: "24px auto 0" }}>
      <ButtonDetail rounded isDarkMode={themeContext.isDark}>
        <Icon icon="angle" />
      </ButtonDetail>
      More to come..
    </BasicButton>
  )
}

export { BasicButton, PrimaryButton }

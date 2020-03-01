import * as React from "react"
import Logo from "../logo/logo"
import {
  StyledHeader,
  StyledMenuSection,
  StyledMenuContainer,
  StyledHeaderText,
  StyledHeaderEnterAnimation
} from "./styled-components"
import { IconButton } from "../buttons"
import { ThemeManagerContext } from "gatsby-styled-components-dark-mode"
import { FadeInLeft } from "../animations/styled-components"

interface HeaderProps {
  animate: boolean
  playHeaderAnimation: boolean
}

export default (props: HeaderProps) => {
  const themeContext: {
    isDark: boolean
    toggleDark: Function
  } = React.useContext(ThemeManagerContext)

  return (
    <StyledHeader>
      <StyledMenuContainer>
        <StyledMenuSection>
          <FadeInLeft
            play={props.playHeaderAnimation}
            animate={props.animate}
            duration={1000}
            delay={400}
          >
            <Logo />
          </FadeInLeft>
          <StyledHeaderText>
            <FadeInLeft
              play={props.playHeaderAnimation}
              animate={props.animate}
              duration={900}
              delay={500}
            >
              Work in progress
            </FadeInLeft>
          </StyledHeaderText>
        </StyledMenuSection>
        <FadeInLeft
          play={props.playHeaderAnimation}
          animate={props.animate}
          duration={800}
          delay={600}
        >
          <IconButton
            icon={themeContext.isDark ? "sun" : "contrast"}
            setIsDarkMode={themeContext.toggleDark}
            isDarkMode={themeContext.isDark}
          />
        </FadeInLeft>
      </StyledMenuContainer>
      <StyledHeaderEnterAnimation play={props.playHeaderAnimation} />
    </StyledHeader>
  )
}

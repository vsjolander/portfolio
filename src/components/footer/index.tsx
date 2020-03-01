import * as React from "react"
import { BannerContact } from "../banners"
import { StyledFooterWrapper } from './styled-components'
import MenuVertical from "../menu/menu-vertical"

const MenuItems = [
  {
    href: "https://dribbble.com/vsjolander",
    value: "Dribble",
  },
  {
    href: "https://github.com/vsjolander",
    value: "Github",
  },
  {
    href: "https://www.linkedin.com/in/vilhelm-sj%C3%B6lander-681ab597",
    value: "LinkedIn",
  },
]

export default () => (
  <StyledFooterWrapper>
    <div className={"container"}>
      <div className={"row"}>
        <div className={"col-12 col-md-6"}>
          <BannerContact />
        </div>
        <div className={"col-12 col-md-2 offset-md-4"}>
          <MenuVertical items={MenuItems} />
        </div>
      </div>
    </div>
  </StyledFooterWrapper>
)

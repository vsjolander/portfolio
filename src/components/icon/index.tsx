import React from "react"
import { StyledIconContainer } from "./styled-components"
import { Sun, Contrast, Angle } from "./icons"

interface IconProps {
  icon: String
}

const getIcon = (icon: String) => {
  switch (icon.toLowerCase()) {
    case "sun":
      return <Sun />
    case "contrast":
      return <Contrast />
    case "angle":
      return <Angle />
    default:
      return <div></div>
  }
}
export default (props: IconProps) => (
  <StyledIconContainer>{getIcon(props.icon)}</StyledIconContainer>
)

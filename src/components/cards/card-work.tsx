import * as React from "react"
import {
  StyledWorkCardThumbnailWrapper,
  StyledWorkCardThumbnailImage,
  StyledWorkCardTitle,
  StyledWorkCardSubHeader,
  StyledWorkCardWrapper,
  StyledWorkCardContent,
  StyledComingSoonIndicator,
} from "./styled-components"

interface WorkCardProps {
  src: string
  title: string
  role: string
}

export default (props: WorkCardProps) => (
  <StyledWorkCardWrapper>
    <StyledWorkCardThumbnailWrapper>
      {props.src && <StyledWorkCardThumbnailImage src={props.src} />}
      <StyledComingSoonIndicator>Coming Soon</StyledComingSoonIndicator>
    </StyledWorkCardThumbnailWrapper>
    <StyledWorkCardContent>
      <StyledWorkCardTitle>{props.title}</StyledWorkCardTitle>
      <StyledWorkCardSubHeader>{props.role}</StyledWorkCardSubHeader>
    </StyledWorkCardContent>
  </StyledWorkCardWrapper>
)

import * as React from "react"
import { FadeInBottom, ZoomOut } from "../animations/styled-components"
import {
  StyledImageContainer,
  StyledCaption,
  StyledCaptionText,
  StyledCaptionYear,
} from "./styled-components"

interface ImageProps {
  setPlayHeaderAnimation: Function;
  duration: number;
  delay: number;
  caption: string;
  year: string;
  src: string;
}

export default (props: ImageProps) => (
  <FadeInBottom duration={600} delay={600}>
    <StyledImageContainer
      delay={props.delay}
      duration={props.duration}
      ref={ref =>
        ref &&
        ref.addEventListener("webkitAnimationEnd", event => {
          props.setPlayHeaderAnimation(true);
        })
      }
    >
      <ZoomOut duration={600} delay={600}>
        <img src={props.src} alt={props.caption ? props.caption : ""} />
      </ZoomOut>
      <StyledCaption>
        {props.caption && (
          <StyledCaptionText>{props.caption}</StyledCaptionText>
        )}
        {props.year && <StyledCaptionYear>{props.year}</StyledCaptionYear>}
      </StyledCaption>
    </StyledImageContainer>
  </FadeInBottom>
)

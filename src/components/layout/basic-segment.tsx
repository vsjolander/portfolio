import * as React from "react";
import {StyledBasicSegment, StyledBasicSecondarySegment} from './styled-components'

export const BasicSegment = (props) => (
  <StyledBasicSegment>
    <div className={"container"}>
      {props.children}
    </div>
  </StyledBasicSegment>
)

export const BasicSecondarySegment = (props) => (
  <StyledBasicSecondarySegment>
    <div className={"container"}>
      {props.children}
    </div>
  </StyledBasicSecondarySegment>
)

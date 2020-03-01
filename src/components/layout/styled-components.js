import styled from "styled-components"

const VERTICAL_PADDING = "40px";

export const StyledContainer = styled.div`
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;

  @media (min-width: 1100px) {
    max-width: 700px;
  }

  @media (min-width: 1200px) {
    max-width: 900px;
  }
  
  @media (min-width: 1400px) {
    max-width: 1200px;
  }
`

export const StyledBasicSegment = styled.div`
  width: 100%;
  padding: ${VERTICAL_PADDING} 0px;
`

export const StyledBasicSecondarySegment = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  transition: ${props => props.theme.easing.background};
  width: 100%;
  padding: ${VERTICAL_PADDING} 0px;
`

export const StyledRoot = styled.div`
  width: 100%;
  height: 100%;
`

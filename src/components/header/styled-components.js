import styled, {keyframes} from "styled-components"

export const StyledHeader = styled.header`
  display: flex;
  flex-direction: row;
  padding: 16px 0px;
  position: relative;
`

export const StyledMenuSection = styled.div`
  display: flex;
  flex: 1 0 auto;
  align-self: ${props => (props.alignSelf ? props.alignSelf : "start")};
`

export const StyledMenuContainer = styled.div`
  width: 100%;
  padding-right: 22px;
  padding-left: 22px;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  flex-direction: row;

  @media (min-width: 1100px) {
    max-width: 960px;
  }

  @media (min-width: 1200px) {
    max-width: 900px;
  }

  @media (min-width: 1400px) {
    max-width: 1200px;
  }
`

export const StyledHeaderText = styled.span`
  font-size: 12px;
  display: flex;
  align-items: center;
  margin-left: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};

  ${props => props.theme.breakpoints.devices.mobileL} {
    font-size: 14px;
  }
`

const StyledHeaderEnterAnimationKeyframes = keyframes`
  0% {
    width: 0%;
    left: 0%;
  }

  50% {
    width: 100%;
    left: 0%;
  }
  
  100% {
    width: 0%;
    left: 100%;
  }
`

export const StyledHeaderEnterAnimation = styled.div`
  width: 2px;
  height: 2px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1;
  background: ${props => props.theme.colors.text};
  margin: auto 0;
  animation: ${StyledHeaderEnterAnimationKeyframes} 450ms ease-in-out forwards;
  animation-play-state: ${props => props.play ? 'running' : 'paused'};
`

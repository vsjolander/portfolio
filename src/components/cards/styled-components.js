import styled from "styled-components"

export const StyledComingSoonIndicator = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  left: 24px;
  padding: 1px 6px 2px;
  pointer-events: none; 
  position: absolute;
  top: 24px;
`

export const StyledWorkCardThumbnailWrapper = styled.div`
  padding-bottom: 70%;
  overflow: hidden;
  position: relative;
  margin-bottom: 16px;
  transition: transform 0.25s cubic-bezier(0.01, 0.36, 0.38, 0.96),
    -webkit-transform 0.25s cubic-bezier(0.01, 0.36, 0.38, 0.96);
  background: ${props => props.theme.colors.gray["200"]};
`

export const StyledWorkCardContent = styled.div`
  text-align: center;

  @media ${props => props.theme.breakpoints.devices.laptop} {
    padding-left: 24px;
    text-align: left;
  }
`

export const StyledWorkCardThumbnailImage = styled.img`
  position: absolute;
  height: 100%;
  width: 100%;
  object-fit: cover;
`

export const StyledWorkCardTitle = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  font-weight: 600;
  line-height: 32px;

  @media ${props => props.theme.breakpoints.devices.laptop} {
    font-size: 22px;
  }
`

export const StyledWorkCardSubHeader = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 16px;
  line-height: 20px;
`

export const StyledWorkCardWrapper = styled.a`
  cursor: pointer;
  display: block;
  margin-bottom: 80px;
  margin-left: -24px;
  margin-right: -24px;

  @media ${props => props.theme.breakpoints.devices.mobileL} {
    margin-bottom: 40px;
    margin-left: 0px;
    margin-right: 0px;
  }
`

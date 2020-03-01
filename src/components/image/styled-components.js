import styled from "styled-components"

export const StyledCaption = styled.div`
  bottom: 0;
  left: 0;
  padding: 0 16px 16px;
  position: absolute;
  right: 0;
  text-align: right;
  pointer-events: none;

  @media ${props => props.theme.breakpoints.devices.laptop} {
    padding: 0 32px 32px;
  }
`
export const StyledCaptionText = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  position: relative;
  top: 10px;
  transition: top 250ms 100ms ease, opacity 250ms 100ms ease;
`
export const StyledCaptionYear = styled.div`
  color: ${props => props.theme.colors.gray["500"]};
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  position: relative;
  top: 10px;
  transition: top 250ms ease, opacity 250ms ease;
`

export const StyledImageContainer = styled.div`
  overflow: hidden;
  position: relative;
  margin-left: -24px;
  margin-right: -24px;

  img {
    object-fit: cover;
    min-height: 250px;
  }
 

  &:hover ${StyledCaptionText}, &:hover ${StyledCaptionYear} {
    top: 0;
    opacity: 1;
  }

  &:hover ${StyledCaptionYear} {
    transition-delay: 100ms;
  }

  &:hover ${StyledCaptionText} {
    transition-delay: 0ms;
  }

  @media ${props => props.theme.breakpoints.devices.mobileL} {
    margin-left: 0;
    margin-right: 0;
  }
`

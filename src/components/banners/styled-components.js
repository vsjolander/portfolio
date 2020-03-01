import styled from "styled-components"

export const StyledBannerWrapper = styled.div`
  margin-bottom: 24px;
  
  @media ${props => props.theme.breakpoints.laptop} {
    margin-bottom: 40px;
  }
`

export const StyledBannerHeader = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`

export const StyledBannerSubHeader = styled.div`
  font-size: 24px;
  font-weight: 400;
  color: ${props => props.theme.colors.gray['400']};
`

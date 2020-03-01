import styled from "styled-components"

export const StyledFooterWrapper = styled.div`
  padding-top: 64px;
  padding-bottom: 40px;

  @media ${props => props.theme.breakpoints.devices.tablet} {
    padding-top: 80px;
    padding-bottom: 64px;
  }
`

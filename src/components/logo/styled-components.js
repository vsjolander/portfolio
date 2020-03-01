import styled from 'styled-components'

export const LogoContainer = styled.div`
  width: 52px;
  min-height: 30px;
  display: flex;
  align-items: center;

  ${props => props.theme.breakpoints.devices.mobileL} {
    width: 72px;
  }
`

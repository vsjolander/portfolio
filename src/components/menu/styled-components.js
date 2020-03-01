import styled from "styled-components";

export const StyledMenuButton = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: end;
  cursor: pointer;
  background: ${props => props.theme.colors.buttonBackground};
`
export const StyledMenuBar = styled.div`
  height: 2px;
  width: 14px;
  background: ${props => props.theme.colors.text};
  
  & + & {
    margin-top: 3px;
  }
`

export const StyledMenuItem = styled.a`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  text-decoration: none;
  padding: 4px 0;
  display: block;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
  
  @media ${props => props.theme.breakpoints.devices.tablet} {
    font-size: 18px;
  }
`


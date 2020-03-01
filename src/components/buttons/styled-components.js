import styled from "styled-components"

export const ButtonDetail = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  background: ${props => props.isDarkMode ? props.theme.colors.gray["600"] : props.theme.colors.gray["300"]}; 
  ${props => props.rounded && 'border-radius: 50%;'}
`

export const BasicButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  font-size: 18px;
  
  &:focus {
    outline: 0;
  }
`

export const PrimaryButton = styled.button`
  height: 30px;
  border: none;
  background: ${props => props.theme.colors.buttonBackground};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: 0;
  }
`

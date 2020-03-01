import styled from "styled-components"

export const StyledHeader1 = styled.h1`
  color: ${props => props.theme.colors.text};
  text-align: left;
  margin: 64px 0;
  opacity: ${props => (props.opacity ? props.opacity : "1")};
`

export const StyledHeader2 = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 2.28571rem;
  text-align: center;
  letter-spacing: -0.25px;
  margin-bottom: 40px;
  opacity: ${props => (props.opacity ? props.opacity : "1")};
`

export const StyledParagraph = styled.p`
  ${props => props.fontSize && `font-size: ${props.fontSize}px;`}
  ${props => props.lineHeight && `line-height: ${props.lineHeight};`}
  ${props => props.marginBottom && `margin-bottom: ${props.marginBottom}px;`}
  opacity: ${props => (props.opacity ? props.opacity : "1")};
  color: ${props => props.theme.colors.textSecondary};
  text-align: left;
`

export const StyledSpan = styled.span`
  display: inline-block;
`

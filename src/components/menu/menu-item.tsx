import * as React from 'react'
import { StyledMenuItem } from './styled-components'

export  interface MenuItemInterface {
  href: string;
  value: string;
}

interface MenuItemProps {
  item: MenuItemInterface;
}

export default (props: MenuItemProps) => (
  <StyledMenuItem href={props.item.href}>
   {props.item.value}
  </StyledMenuItem>
)

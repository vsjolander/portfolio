import * as React from 'react'
import MenuItem, {MenuItemInterface} from './menu-item'

interface MenuVerticalProps {
  items: Array<MenuItemInterface>;
}

export default (props: MenuVerticalProps) => (
  <div>
    {props.items && props.items.map((item, index) => <MenuItem key={index} item={item} />)}
  </div>
)

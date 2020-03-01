import React from "react"
import "./src/styles/global.css"
import "./src/styles/typography.css"
import "./src/styles/bootstrap-grid.css"
import Layout from './src/components/layout'

export const wrapPageElement = ({ element, props }) => {
  console.log({element, props});
  return <Layout {...props}>{element}</Layout>
};

export const onClientEntry = () => {
  window.onload = () => {
    setTimeout(() => document.documentElement.classList.add('animate'), 1000)
  }
}

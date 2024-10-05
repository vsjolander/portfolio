var plugins = [{
      plugin: require('/Users/vilhelmsjolander/code/portfolio/node_modules/gatsby-plugin-react-helmet/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      plugin: require('/Users/vilhelmsjolander/code/portfolio/node_modules/gatsby-plugin-google-fonts/gatsby-ssr'),
      options: {"plugins":[],"fonts":["source sans pro:300,400,600,700"],"display":"swap"},
    },{
      plugin: require('/Users/vilhelmsjolander/code/portfolio/node_modules/gatsby-plugin-styled-components/gatsby-ssr'),
      options: {"plugins":[],"displayName":false,"fileName":true,"minify":true,"namespace":"","transpileTemplateLiterals":true,"pure":false},
    },{
      plugin: require('/Users/vilhelmsjolander/code/portfolio/node_modules/gatsby-styled-components-dark-mode/gatsby-ssr'),
      options: {"plugins":[],"light":{"breakpoints":{"size":{"mobileS":"320px","mobileM":"375px","mobileL":"425px","tablet":"768px","laptop":"992px","laptopL":"1440px","desktop":"2560px"},"devices":{"mobileS":"(min-width: 320px)","mobileM":"(min-width: 375px)","mobileL":"(min-width: 425px)","tablet":"(min-width: 768px)","laptop":"(min-width: 992px)","laptopL":"(min-width: 1440px)","desktop":"(min-width: 2560px)"}},"colors":{"background":"#FFFFFF","backgroundSecondary":"#FAFAFA","cardBackground":"#F2F2F2","buttonBackground":"#F2F2F2","text":"#151515","textSecondary":"#6D6D6D","gray":{"100":"#FAFAFA","200":"#F2F2F2","300":"#C8C8C8","400":"#9F9F9F","500":"#6D6D6D","600":"#3D3C3C","700":"#252525","800":"#1A1A1A","900":"#151515"}},"easing":{"background":".7s cubic-bezier(0, 1.01, 0.37, 0.99)"}},"dark":{"breakpoints":{"size":{"mobileS":"320px","mobileM":"375px","mobileL":"425px","tablet":"768px","laptop":"992px","laptopL":"1440px","desktop":"2560px"},"devices":{"mobileS":"(min-width: 320px)","mobileM":"(min-width: 375px)","mobileL":"(min-width: 425px)","tablet":"(min-width: 768px)","laptop":"(min-width: 992px)","laptopL":"(min-width: 1440px)","desktop":"(min-width: 2560px)"}},"colors":{"background":"#0F0F0F","backgroundSecondary":"#151515","cardBackground":"#1A1A1A","buttonBackground":"#1A1A1A","text":"#FFFFFF","textSecondary":"#9F9F9F","gray":{"100":"#FAFAFA","200":"#F2F2F2","300":"#C8C8C8","400":"#9F9F9F","500":"#6D6D6D","600":"#3D3C3C","700":"#252525","800":"#1A1A1A","900":"#151515"}},"easing":{"background":".7s cubic-bezier(0, 1.01, 0.37, 0.99)"}}},
    },{
      plugin: require('/Users/vilhelmsjolander/code/portfolio/node_modules/gatsby-plugin-google-analytics/gatsby-ssr'),
      options: {"plugins":[],"trackingId":"UA-57350713-1","head":true,"anonymize":true,"pageTransitionDelay":0,"respectDNT":false,"exclude":[]},
    }]
// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   {
//     plugin: require("/path/to/plugin1/gatsby-ssr.js"),
//     options: { ... },
//   },
//   {
//     plugin: require("/path/to/plugin2/gatsby-ssr.js"),
//     options: { ... },
//   },
// ]

const apis = require(`./api-ssr-docs`)

// Run the specified API in any plugins that have implemented it
module.exports = (api, args, defaultReturn, argTransform) => {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  // Run each plugin in series.
  // eslint-disable-next-line no-undef
  let results = plugins.map(plugin => {
    if (!plugin.plugin[api]) {
      return undefined
    }
    const result = plugin.plugin[api](args, plugin.options)
    if (result && argTransform) {
      args = argTransform({ args, result })
    }
    return result
  })

  // Filter out undefined results.
  results = results.filter(result => typeof result !== `undefined`)

  if (results.length > 0) {
    return results
  } else {
    return [defaultReturn]
  }
}

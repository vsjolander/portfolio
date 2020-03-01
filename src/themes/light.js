module.exports = {
  breakpoints: {
    size: {
      mobileS: "320px",
      mobileM: "375px",
      mobileL: "425px",
      tablet: "768px",
      laptop: "992px",
      laptopL: "1440px",
      desktop: "2560px",
    },
    devices: {
      mobileS: `(min-width: 320px)`,
      mobileM: `(min-width: 375px)`,
      mobileL: `(min-width: 425px)`,
      tablet: `(min-width: 768px)`,
      laptop: `(min-width: 992px)`,
      laptopL: `(min-width: 1440px)`,
      desktop: `(min-width: 2560px)`,
    },
  },
  colors: {
    background: "#FFFFFF",
    backgroundSecondary: "#FAFAFA",
    cardBackground: "#F2F2F2",
    buttonBackground: "#F2F2F2",
    text: "#151515",
    textSecondary: "#6D6D6D",
    gray: {
      '100': '#FAFAFA',
      '200': '#F2F2F2',
      '300': '#C8C8C8',
      '400': '#9F9F9F',
      '500': '#6D6D6D',
      '600': '#3D3C3C',
      '700': '#252525',
      '800': '#1A1A1A',
      '900': '#151515',
    }
  },
  easing: { background: ".7s cubic-bezier(0, 1.01, 0.37, 0.99)" },
}

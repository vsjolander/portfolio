export const checkPreferedMode = () => {
  const stored = localStorage.getItem("isDarkMode")
  if (stored === null) {
    console.log(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return stored === "true"
}

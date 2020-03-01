import * as React from "react"
import { Helmet } from "react-helmet"
import {
  BasicSegment,
  BasicSecondarySegment,
} from "../components/layout/basic-segment"
import {
  StyledHeader1,
  StyledHeader2,
  StyledParagraph,
} from "../components/typography"
import Image from "../components/image"
import WorkCard from "../components/cards/card-work"
import { CallToActionButton } from "../components/buttons"
import Footer from "../components/footer"

export default props => {
  return (
    <main>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Page not Found</title>
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-icon-57x57.png"/>
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-icon-60x60.png"/>
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-icon-72x72.png"/>
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-icon-76x76.png"/>
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-icon-114x114.png"/>
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-icon-120x120.png"/>
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-icon-144x144.png"/>
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152x152.png"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180x180.png"/>
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-icon-192x192.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="" />
        <meta name="image" content="/vos-works-social.jpg" />
        <meta property="og:title" content="Page not found"/>
        <meta property="og:description" content="Sorry mate, I have either removed or not created the page you wish to look at." />
        <meta property="og:image" content="/vos-works-social.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="vsjolander" />
        <meta name="twitter:title" content="Page not found" />
        <meta name="twitter:description" content="Sorry mate, I have either removed or not created the page you wish to look at." />
        <meta name="twitter:image" content="/vos-works-social.jpg" />
      </Helmet>
      <BasicSegment>
        <div className="row">
          <div className={"col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3"}>
            <StyledHeader1 className={"fadeInBottom"}>
              404 not found
            </StyledHeader1>
            <StyledParagraph
              fontSize={20}
              lineHeight={"28px"}
              marginBottom={40}
              className={"fadeInBottom animationDelay100"}
            >
              Sorry mate, I have either removed or not created the page you wish to look at.
            </StyledParagraph>
          </div>
        </div>
        <div className="row">
          <div className={"col-12 col-md-10 offset-md-1 col-lg-8 offset-lg-2"}>
            <Image
              src={"/waves.jpg"}
              className={"fadeInBottom animationDelay200"}
            />
          </div>
        </div>
      </BasicSegment>
      <Footer />
    </main>
  )
}

import * as React from "react"
import { Helmet } from "react-helmet"
import {
  BasicSegment,
  BasicSecondarySegment,
} from "../components/layout/basic-segment"
import {
  StyledHeader1,
  StyledHeader2,
  StyledSpan,
} from "../components/typography"
import Image from "../components/image"
import WorkCard from "../components/cards/card-work"
import { CallToActionButton } from "../components/buttons"
import Footer from "../components/footer"
import Header from "../components/header"
import { FadeInBottom, RotateInBottom } from '../components/animations/styled-components'
import { useState } from "react"

const vosSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Stockholm",
    addressRegion: "Bromma",
    postalCode: "16830",
    streetAddress: "Gustav III:s väg 37",
  },
  email: "vilhelm@sjolander.design",
  image: "https://vos.works/hero-image",
  jobTitle: "Developer",
  name: "Vilhelm Sjölander",
  alumniOf: "Hyper Island",
  birthPlace: "Stockholm",
  birthDate: "1990-09-04",
  height: "183 centimeters",
  gender: "male",
  nationality: "Swedish",
  telephone: "+46706665486",
  url: "http://www.example.com",
  sameAs: [
    "https://www.facebook.com/",
    "https://www.linkedin.com/",
    "http://twitter.com/",
    "http://instagram.com/",
    "https://plus.google.com/",
  ],
}

export default props => {

  const [playHeaderAnimation, setPlayHeaderAnimation] = useState(false)

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          Vilhelm Olof Sjölander | Developer with a passion for design and UX
        </title>
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/icons/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/icons/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/icons/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/icons/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/icons/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/icons/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="" />
        <meta name="image" content="/vos-works-social.jpg" />
        <meta
          property="og:title"
          content="Vilhelm Sjölander | Developer with a passion for design and UX"
        />
        <meta
          property="og:description"
          content="Vilhelm Olof Sjölander is  developer from Sweden who has a passion for design and user experience"
        />
        <meta property="og:image" content="/vos-works-social.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="vsjolander" />
        <meta
          name="twitter:title"
          content="Vilhelm Sjölander | Developer with a passion for design and UX"
        />
        <meta
          name="twitter:description"
          content="Vilhelm Olof Sjölander is  developer from Sweden who has a passion for design and user experience"
        />
        <meta name="twitter:image" content="/vos-works-social.jpg" />
      </Helmet>
      <Header animate={true} playHeaderAnimation={playHeaderAnimation} />
      <main>
        <BasicSegment>
          <div className="row">
            <div className={"col-12 col-md-8 offset-md-2"}>
              <StyledHeader1
                fontSize={18}
                lineHeight={"22px"}
                marginBottom={40}
              >
                <RotateInBottom duration={1200} delay={0}>
                  <StyledSpan>
                    Developer from Sweden
                  </StyledSpan>
                </RotateInBottom>
                <RotateInBottom duration={1000} delay={200}>
                  <StyledSpan>
                    with a passion for design
                  </StyledSpan>
                </RotateInBottom>
                <RotateInBottom duration={800} delay={400}>
                  <StyledSpan>
                    and user experience
                  </StyledSpan>
                </RotateInBottom>
              </StyledHeader1>
            </div>
          </div>
          <div className="row">
            <div className={"col-12 col-md-10 offset-md-1"}>
              <Image
                duration={600}
                delay={600}
                setPlayHeaderAnimation={setPlayHeaderAnimation}
                src={"/hero-image.jpg"}
                caption={"Me being my best self"}
                year={"2018"}
              />
            </div>
          </div>
        </BasicSegment>
        <BasicSecondarySegment>
          <div className="row">
            <div className="col-12">
              <StyledHeader2>Work</StyledHeader2>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-5 col-lg-4 offset-md-1 offset-lg-2">
              <WorkCard
                title={"Genero Solution"}
                role={"Developer & Designer"}
                src={"/genero-thumbnail.jpg"}
              />
            </div>
            <div className="col-12 col-md-5 col-lg-4">
              <WorkCard
                title={"Type to Design"}
                role={"Developer"}
                src={"/typetodesign.jpg"}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <CallToActionButton />
            </div>
          </div>
        </BasicSecondarySegment>
        <Footer />
      </main>
    </>
  )
}

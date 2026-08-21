"use client"

import { useState } from "react"
import {
  VOS,
  IKEA,
  HugoBoss,
  Klarna,
  WWF,
  Electrolux,
  Google,
  Microsoft,
} from "@/components/icons"
import { FadeIn } from "@/components/ui/fade-in"
import { SplitLines } from "@/components/ui/split-lines"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HeroGradient } from "@/components/ui/hero-gradient"

const workExperience = [
  {
    role: "Head of Digital Direction & Excellence",
    company: "SEB",
    period: "2025 – Ongoing",
    description:
      "Leading strategic digital direction and design system governance across platforms.",
  },
  {
    role: "Team Manager",
    company: "SEB",
    period: "2023 – 2025",
    description:
      "Managed a team of designers on SEB's design system. Responsible for staff management, team development, and aligning business with design needs.",
  },
  {
    role: "Lead Developer, Green Design System",
    company: "SEB",
    period: "2022 – 2023",
    description:
      "Built core components with Web Components, React, and Angular. Led development sprints, automation, and DevOps in GitHub — combining technical leadership with project management to ensure adoption across digital channels.",
  },
  {
    role: "Prototyper",
    company: "SEB",
    period: "2020 – 2022",
    description:
      "Developed interactive prototypes in Figma and code to support innovation and product development. Contributed to design sprints, workshops, and cross-functional collaboration using Node.js and GCP.",
  },
  {
    role: "Teacher",
    company: "Le Wagon",
    period: "2020 – 2021",
    description:
      "Taught coding bootcamps with a focus on JavaScript, HTML, CSS, and design sprint methodology.",
  },
  {
    role: "Solopreneur - Designer & Developer",
    company: "VOS AB",
    period: "2018 – Ongoing",
    description:
      "Running a consulting business, designing and developing digital products for clients.",
  },
  {
    role: "Head of IT",
    company: "Swiss Clinic",
    period: "2017 – 2018",
    description:
      "Led IT operations and built the technical infrastructure for a fast-growing e-commerce company. Worked with Magento, React, Node.js, MongoDB, and partner integrations.",
  },
  {
    role: "Head of Design",
    company: "Swiss Clinic",
    period: "2015 – 2017",
    description:
      "Built and led the design team, creating product packaging, branding, and high-performing marketing material with a strong focus on brand identity and conversion.",
  },
  {
    role: "Digital Intern",
    company: "SuperHeroes Amsterdam",
    period: "2015",
    description:
      "Contributed to a variety of projects through design, coding, and creative digital production.",
  },
]

const education = [
  {
    title: "Interactive Art Director",
    school: "Hyper Island",
    period: "2015 - 2016",
  },
  {
    title: "Media Technology",
    school: "Södertörns University",
    period: "2013",
  },
  {
    title: "Graphic design",
    school: "Berghs School of Communication",
    period: "2012",
  },
]

const projects = [
  {
    title: "Green Design System",
    client: "SEB",
    description:
      "Enterprise-wide design system serving millions of users across SEB's digital channels. Built with Web Components, React, and Angular — with Figma as the design source of truth.",
    tags: ["Design System", "Web Components", "React", "Angular"],
  },
  {
    title: "E-commerce & Brand",
    client: "Swiss Clinic",
    description:
      "End-to-end digital presence for a fast-growing beauty brand — from brand identity and packaging to a full Magento platform with automation and partner integrations.",
    tags: ["E-commerce", "Branding", "Full-stack"],
  },
  {
    title: "Digital Products",
    client: "Various clients",
    description:
      "Designing and developing digital products as an independent consultant. From early-stage startups to established companies needing design and engineering muscle.",
    tags: ["Product Design", "Development", "Strategy"],
  },
]

const clientLogos = [
  { Component: IKEA, name: "IKEA" },
  { Component: HugoBoss, name: "Hugo Boss" },
  { Component: Klarna, name: "Klarna" },
  { Component: WWF, name: "WWF" },
  { Component: Electrolux, name: "Electrolux" },
  { Component: Google, name: "Google" },
  { Component: Microsoft, name: "Microsoft" },
]

const contact = [
  {
    label: "Email",
    href: "mailto:vilhelm@sjolander.design",
    text: "vilhelm@sjolander.design",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/vilhelmsjölander-681ab597",
    text: "linkedin.com/in/vilhelmsjölander",
  },
  {
    label: "GitHub",
    href: "https://github.com/vsjolander",
    text: "github.com/vsjolander",
  },
  {
    label: "Dribbble",
    href: "https://dribbble.com/vsjolander",
    text: "dribbble.com/vsjolander",
  },
]

export default function Home() {
  const [cvOpen, setCvOpen] = useState(false)

  const openCv = () => setCvOpen(true)

  return (
    <>
      <HeroGradient />
      <div className="relative max-w-2xl mx-auto px-6 pt-56 pb-40 space-y-24">
        <section>
          <div className="flex items-center mb-8 gap-6">
            <VOS />
            <nav>
              <ul className="flex items-center gap-1">
                <li>
                  <FadeIn delay={1000}>
                    <a
                      href="#work"
                      className="focus-ring rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      Work
                    </a>
                  </FadeIn>
                </li>
                <li>
                  <FadeIn delay={1100}>
                    <button
                      className="focus-ring rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                      onClick={openCv}
                    >
                      About
                    </button>
                  </FadeIn>
                </li>
                <li>
                  <FadeIn delay={1200}>
                    <a
                      href="#contact"
                      className="focus-ring rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      Contact
                    </a>
                  </FadeIn>
                </li>
              </ul>
            </nav>
          </div>

          <SplitLines className="text-lg leading-[1.425] max-w-2xl">
            {
              "Vilhelm is a designer and developer who takes projects from idea to launch. He has over 10 years of experience working product design, front-end engineering, and team leadership. He is currently working at SEB leading the strategic development of SEB's design system and direction cross channels."
            }
          </SplitLines>
        </section>

        {/* Experience — scroll-triggered, staggered by index */}
        <section>
          <FadeIn delay={350}>
            <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
              Work
            </p>
          </FadeIn>
          <div className="space-y-10 text-sm">
            {workExperience.slice(0, 2).map((work, i) => (
              <FadeIn key={i} delay={400 + i * 100}>
                <div className="grid gap-4 sm:grid-cols-[48px_1fr]">
                  <div className="flex aspect-square w-12 items-center justify-center rounded-lg border border-zinc-200 transition-colors duration-300 dark:border-zinc-800 sm:w-full"></div>
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-col">
                          <p className="font-medium">{work.company}</p>
                          <p className="text-muted-foreground">{work.role}</p>
                        </div>
                        <p className="text-muted-foreground">
                          {work.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-nowrap md:text-right">
                        {work.period}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={400 + workExperience.slice(0, 2).length * 100}>
            <div className="flex justify-center mt-10 gap-2">
              <Button
                onClick={openCv}
                variant="default"
                size="sm"
                className="rounded-full"
              >
                View full resume
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* Selected work — scroll-triggered, or staggered after Experience if already in view on load */}
        <section id="work">
          <FadeIn initialDelay={750}>
            <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
              Selected work
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <FadeIn key={i} delay={i * 80} initialDelay={850 + i * 100}>
                <div className="space-y-3">
                  <div className="bg-zinc-700 aspect-[5/3] rounded-sm"></div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{project.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {project.client}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Contact — scroll-triggered */}
        <section id="contact">
          <FadeIn>
            <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
              Contact
            </p>
          </FadeIn>
          <div className="space-y-3">
            {contact.map((item, i) => (
              <FadeIn key={item.label} delay={i * 60}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground w-16">
                    {item.label}
                  </span>
                  <a
                    href={item.href}
                    target={
                      item.href.startsWith("mailto") ? undefined : "_blank"
                    }
                    rel="noopener noreferrer"
                    className="focus-ring rounded-full px-2 text-sm hover:text-foreground text-muted-foreground transition-colors"
                  >
                    {item.text}
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CV Modal */}
        <Dialog open={cvOpen} onOpenChange={setCvOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-8 mb-4">
                  <VOS />
                  <h2 className="text-2xl text-muted-foreground font-medium tracking-tight">
                    Resume
                  </h2>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-16">
              <div>
                <SplitLines
                  className="text-lg leading-[1.425] max-w-2xl mb-10"
                  delay={100}
                >
                  {
                    "Vilhelm leads a team at SEB responsible for the bank's design system, accessibility standards, and digital brand. His work sits where design meets engineering and the operational side of keeping design consistent at scale. He cares about the unglamorous parts that make design actually work in a large organization—clear standards, shared tooling, and accessibility that's built in rather than bolted on. He's comfortable moving between strategy and the technical details."
                  }
                </SplitLines>
                <FadeIn delay={350}>
                  <h3 className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
                    Experience
                  </h3>
                </FadeIn>
                <div className="space-y-6 mb-12">
                  {workExperience.map((item, i) => (
                    <FadeIn key={item.role} initialDelay={400 + i * 100}>
                      <div key={i}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium">{item.role}</p>
                          <span className="text-sm text-muted-foreground">
                            {item.period}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.company}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
                <FadeIn delay={350}>
                  <h3 className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
                    Education
                  </h3>
                </FadeIn>
                <div className="space-y-6">
                  {education.map((item, i) => (
                    <FadeIn key={item.title} initialDelay={400 + i * 100}>
                      <div key={i}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium">{item.title}</p>
                          <span className="text-sm text-muted-foreground">
                            {item.period}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.school}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono text-muted-foreground mb-4 tracking-widest uppercase">
                  Skills
                </h3>
                <p className="text-sm leading-relaxed">
                  Managing, Leadership, Communication, Facilitating workshops,
                  Project Management, Agile met hodologies, Delegation, Project
                  management, Strategic planning, Business planning, Design
                  systems, Stakeholder management, Budgeting, Decision making,
                  Test driven development, Accessibility, WCAG, Product design,
                  Visual design, User research, Scrum, Jira, SAFE, Sketch,
                  Figma, Adobe Creative Suite, Invision, Graphic Design,
                  Prototyping, Interaction Design, React, Angular,
                  Webcomponents, Google Cloud Platform, AWS, CI, GIT, Github,
                  Magento, Drupal, Wordpress, PHP, SQL, Azure, Webpack, Vite,
                  Vue, Webpack, Rollup, Shopify, Google analytics, Heroku, Vue,
                  Javascript, SCSS, SASS, LESS, Angular, Bootstrap, TypeScript,
                  CSS3, Gulp, Grunt, HTML, Gatsby, Wordpress, Node.js, NextJS,
                  Vercel, RxJS, Bit bucket, CDN, Docker, jQuery,
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

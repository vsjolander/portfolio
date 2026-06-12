"use client"

import { useState } from "react"
import Logo from "@/components/icons/logo"
import { FadeIn } from "@/components/ui/fade-in"
import { SplitLines } from "@/components/ui/split-lines"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const experience = [
  {
    role: "Head of Digital Direction & Excellence",
    company: "SEB",
    period: "2025 – Ongoing",
    description:
      "Leading the strategic development of digital direction across channels, driving customer-centric innovation and consistency. Oversee governance and adoption of the design system across platforms, ensuring scalability and quality.",
  },
  {
    role: "Team Manager, Green Design System",
    company: "SEB",
    period: "2023 – 2025",
    description:
      "Leading the design system team with responsibility for staff management, team development, and stakeholder collaboration. Driving growth and adoption by aligning business and design needs across digital channels.",
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
    role: "Freelance Designer & Developer",
    company: "Vilhelm Olof Sjölander AB",
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-40 space-y-24">
      <section>
        <div className="flex items-center mb-8 gap-6">
          <Logo />
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <FadeIn delay={700}>
                  <a
                    href="#work"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Work
                  </a>
                </FadeIn>
              </li>
              <li>
                <FadeIn delay={800}>
                  <a
                    href="#about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </FadeIn>
              </li>
              <li>
                <FadeIn delay={900}>
                  <a
                    href="#contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            "Vilhelm is a designer and developer who takes projects from idea to launch. He has over 10 years of experience working product design, front-end engineering, and team leadership. He is currently Head of Digital Direction & Excellence at SEB, leading the strategic development of SEB's design system, digital accessibility and direction across channels."
          }
        </SplitLines>
      </section>

      {/* Experience — scroll-triggered, staggered by index */}
      <section id="work">
        <FadeIn delay={350}>
          <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
            Experience
          </p>
        </FadeIn>
        <div className="space-y-10">
          {experience.slice(0, 2).map((item, i) => (
            <FadeIn key={i} delay={400 + i * 100}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-1 md:gap-8">
                <div>
                  <p className="font-medium">{item.role}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.company}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap md:text-right">
                  {item.period}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={400 + experience.slice(0, 2).length * 100}>
          <div className="flex justify-center mt-10 gap-2">
            <Button
              onClick={() => setCvOpen(true)}
              variant="default"
              size="sm"
              className="rounded-full"
            >
              View full resume
            </Button>
            <Button
              onClick={() => setCvOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              About
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Selected work — scroll-triggered, or staggered after Experience if already in view on load */}
      <section id="projects">
        <FadeIn initialDelay={750}>
          <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
            Selected work
          </p>
        </FadeIn>
        <div className="space-y-4">
          {projects.map((project, i) => (
            <FadeIn key={i} delay={i * 80} initialDelay={850 + i * 100}>
              <div className="p-6 rounded-xl bg-secondary">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">{project.title}</h3>
                  <span className="text-sm text-muted-foreground ml-4">
                    {project.client}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-background text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
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
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-16">
                  {item.label}
                </span>
                <a
                  href={item.href}
                  target={item.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="text-sm hover:text-foreground text-muted-foreground transition-colors"
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
        <DialogContent className="max-h-[80vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4 mb-4">
                <Logo />
                <h2 className="text-xl font-semibold">
                  Vilhelm Olof Sjölander
                </h2>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            {/* Experience Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Experience</h3>
              <div className="space-y-6">
                {experience.map((item, i) => (
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
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm mb-2">Design</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Figma</li>
                    <li>• User Research</li>
                    <li>• Design Systems</li>
                    <li>• Prototyping</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">Engineering</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• React</li>
                    <li>• TypeScript</li>
                    <li>• Web Components</li>
                    <li>• Node.js</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">Leadership</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Team Management</li>
                    <li>• Stakeholder Alignment</li>
                    <li>• Strategic Planning</li>
                    <li>• Mentoring</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">Other</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Angular</li>
                    <li>• MongoDB</li>
                    <li>• GCP</li>
                    <li>• GitHub</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

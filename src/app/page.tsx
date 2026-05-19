import GradientCanvas from "@/components/ui/gradient"
import Logo from "@/components/icons/logo"

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
  { label: "Email", href: "mailto:vilhelm@sjolander.design", text: "vilhelm@sjolander.design" },
  { label: "LinkedIn", href: "https://linkedin.com/in/vilhelmsjölander-681ab597", text: "linkedin.com/in/vilhelmsjölander" },
  { label: "GitHub", href: "https://github.com/vsjolander", text: "github.com/vsjolander" },
  { label: "Dribbble", href: "https://dribbble.com/vsjolander", text: "dribbble.com/vsjolander" },
]

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-40 space-y-24">
      <section>
        <div className="flex items-center mb-8 gap-6">
          <Logo />
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <a href="#work" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Work
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="text-lg leading-relaxed max-w-2xl">
          Vilhelm is a designer and developer who takes projects from
          idea to launch. He has over 10 years of experience working product design, front-end
          engineering, and team leadership. Vilhelm currently works as a manager at one of Sweden's larges banks.
        </p>
      </section>

      <section id="work">
        <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
          Experience
        </p>
        <div className="space-y-10">
          {experience.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-1 md:gap-8">
              <div>
                <p className="font-medium">{item.role}</p>
                <p className="text-sm text-muted-foreground mb-2">{item.company}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
              <p className="text-sm text-muted-foreground whitespace-nowrap md:text-right">
                {item.period}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="projects">
        <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
          Selected work
        </p>
        <div className="space-y-4">
          {projects.map((project, i) => (
            <div key={i} className="p-6 rounded-xl bg-secondary">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{project.title}</h3>
                <span className="text-sm text-muted-foreground ml-4">{project.client}</span>
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
          ))}
        </div>
      </section>

      <section id="contact">
        <p className="text-xs font-mono text-muted-foreground mb-8 tracking-widest uppercase">
          Contact
        </p>
        <div className="space-y-3">
          {contact.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-16">{item.label}</span>
              <a
                href={item.href}
                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-sm hover:text-foreground text-muted-foreground transition-colors"
              >
                {item.text}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

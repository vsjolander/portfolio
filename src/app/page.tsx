import GradientCanvas from "@/components/gradient/gradient-canvas"

export default function Home() {
  return (
    <>
      <div className="container mx-auto">
        <GradientCanvas className="rounded-3xl overflow-hidden">
          <h1 className="absolute items-center m-auto px-6 m:px-10 flex align-center inset-0 text-4xl lg:text-5xl font-semi-bold tracking-tight text-center">
            Digital product builder with over a decade of experience
          </h1>
        </GradientCanvas>
      </div>
    </>
  )
}

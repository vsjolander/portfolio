import GradientCanvas from "@/components/gradient/gradient-canvas"

export default function Home() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-2 md:pr-14">
        <GradientCanvas className="rounded-3xl overflow-hidden">
          <h1 className="absolute items-center m-auto w-full md:w-3/5 flex align-center justify-center inset-0 text-4xl lg:text-5xl font-semi-bold tracking-tight text-center px-6">
            Designer & developer crafting digital experiences that delight and
            deliver.
          </h1>
        </GradientCanvas>
      </section>
      <section className="max-w-6xl mx-auto px-2 md:p-38">
        <p className="text-xl text-center">
          Vilhelm Sjölander is an award winning Stockholm-based designer and
          developer and has been building digital products for over a decade.
        </p>
      </section>
    </>
  )
}

const foundationItems = [
  "Next.js App Router",
  "TypeScript",
  "Tailwind CSS",
  "Prepared component and library folders",
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="border-b border-border pb-6">
          <p className="text-sm font-medium text-primary">M1 Technical Foundation</p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Commerce AI Platform
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Frontend skeleton for a multi-tenant commerce operations platform.
            Product workflows, app shell, and evidence-first review screens are
            intentionally reserved for later milestones.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {foundationItems.map((item) => (
            <div
              className="rounded-lg border border-border bg-white p-4 shadow-sm"
              key={item}
            >
              <p className="text-sm font-medium text-foreground">{item}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            Local runtime
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            The web surface is ready for the app shell, tenant context, and
            evidence-first workflows once the foundation services are in place.
          </p>
        </div>
      </section>
    </main>
  );
}

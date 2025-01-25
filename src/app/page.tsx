import Table from './components/table';

export default function Home() {
  return (
    <div className="min-h-screen p-4 pb-20 sm:p-8 md:p-20 font-[family-name:var(--font-font-geist-sans)]">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">GZCLP</h1>
      </header>
      <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        <Table title="A1" />
        <Table title="A2" />
        <Table title="B1" />
        <Table title="B2" />
      </main>
    </div>
  );
}

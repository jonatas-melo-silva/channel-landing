// Casca da fase 0. Header, lista de páginas e rodapé entram na fase 4.
export default function App() {
  return (
    <main className="w-80 p-4">
      <h1 className="text-base font-semibold">{browser.i18n.getMessage('extName')}</h1>
    </main>
  );
}

import "../styles.css";

export const metadata = {
  title: "Focinho Feliz — Álbum de 2025",
  description: "Um álbum cheio de fotos, banhos e histórias dos nossos melhores amigos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

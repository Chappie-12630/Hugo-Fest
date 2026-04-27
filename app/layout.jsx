// app/layout.jsx
export const metadata = {
  title: "Hugo Fest — Hugo Monroy's Birthday",
  description: "Celebración de cumpleaños · 20 de Julio 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#07090E" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#07090E" }}>
        {children}
      </body>
    </html>
  );
}

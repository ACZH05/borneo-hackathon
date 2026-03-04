import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// --- Metadata ---
export const metadata = {
  title: "BorNEO AI",
  description: "BorNEO AI is a lightweight, AI-driven disaster resilience platform that built with a 'low-bandwidth' philosophy. Our mission is to provide a critical lifeline for communities in Borneo, ensuring every user has access to life-saving information when it matters most.",
};

// --- Root Layout (Home) ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        <head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&amp;display=swap"/> {/* Import Google Manrope font for headings and UI elements. */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"/> {/* Import Google Material Symbols font for icons. */}
        </head>

        <body className="antialiased flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main> {/* Pass the content in "page.tsx" as children to the layout */}
            <Footer />
        </body>

    </html>
  );
}
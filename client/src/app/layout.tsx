import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseStadium | Intelligent Safety Orchestrator",
  description: "Elite digital twin for stadium crowd management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased h-full" suppressHydrationWarning>
      <body 
        className="font-sans bg-[#020617] text-slate-50 min-h-screen w-full overflow-x-hidden"
        style={{ colorScheme: 'dark' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

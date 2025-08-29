import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A comprehensive task management application",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <body
        className={`${inter.className} h-full w-full antialiased bg-background text-gray-900`}
      >
        {/* Responsive container */}
        <div className="min-h-full w-full flex flex-col">{children}</div>
      </body>
    </html>
  );
}

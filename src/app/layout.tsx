import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import QueryProvider from "../providers/query-provider";
import { AuthProvider } from "@/components/AuthSession";

export const metadata: Metadata = {
  title: "Lang App",
  description: "Language Learning Application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lang App",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased  flex flex-col  ">
        <AuthProvider>
          <QueryProvider>
            <Header />
            <Toaster position="top-center" reverseOrder={false} />
            <main className=" bg-slate-50 font-sans dark:bg-black  max-h-[90vh] ">
              {children}
            </main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

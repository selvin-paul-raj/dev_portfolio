import type { Metadata } from "next";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

import ActiveSectionContextProvider from "@/context/active-section-context";
import ThemeContextProvider from "@/context/theme-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://selvinpaulraj.vercel.app"),
  title: "Selvin PaulRaj | Full-Stack MERN Developer Portfolio",
  description:
    "Explore the portfolio of Selvin PaulRaj K, a passionate full-stack MERN web developer based in India. Discover projects, skills, and contact information.",
  keywords: [
    "Selvin PaulRaj",
    "Full-stack Developer",
    "Nextjs",
    "Portfolio",
    "MERN Stack",
    "MERN Developer",
    "MERN Stack Developer",
    "MERN Stack Projects",
    "Full Stack Developer",
    "Web Developer",
    "Frontend Developer",
    "Backend Developer",
    "JavaScript",
    "React Developer",
    "Node.js Developer",
    "Chennai Developer",
    "Selvin PaulRaj K",
    "Portfolio Website",
    "Personal Portfolio",
    "Developer Portfolio",
    "Web Development",
    "GenXRverse",
    "MERN",
    "React",
    "Node.js",
    "MongoDB",
    "Web Developer",
    "Portfolio",
    "Indian Developer",
  ],
  authors: [{ name: "Selvin PaulRaj K", url: "https://selvinpaulraj.vercel.app" }],
  creator: "Selvin PaulRaj K",
  icons: {
    icon: "/selvinpaulrajK_profile.png",
    shortcut: "/selvinpaulrajK_profile.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://selvinpaulraj.vercel.app",
    title: "Selvin PaulRaj | Full-Stack Developer",
    description:
      "Showcasing MERN stack projects, development skills, and contact details.",
    images: [
      {
        url: "/selvinpaulrajK_profile.png",
        width: 800,
        height: 600,
        alt: "Selvin PaulRaj K Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selvin PaulRaj | MERN Developer Portfolio",
    description:
      "Check out Selvin's full-stack web developer projects, skills, and resume.",
    creator: "@selvinpaulrajk", // Replace with your actual handle
    images: ["/selvinpaulrajK_profile.png"],
  },
  verification: {
    google: "y8_t3SKugG2qZzqDFrgclLRNRh5m62dhX-OTUWKlthc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Selvin PaulRaj K",
              url: "https://yourdomain.com",
              image: "https://yourdomain.com/selvinpaulrajK_profile.png",
              sameAs: [
                "https://github.com/selvinpaulrajK",
                "https://linkedin.com/in/selvinpaulrajK",
                // Add other social links if applicable
              ],
              jobTitle: "Full-Stack Developer",
              worksFor: {
                "@type": "Organization",
                name: "Freelance / Self-employed",
              },
            }),
          }}
        />
      </head>
      <body
        className="bg-[#FAFAF9] text-gray-950 relative pt-20 dark:bg-[#000] dark:text-white dark:text-opacity-80"
      >
        {/* Microsoft Clarity Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "oo7sqjfgyt");`,
          }}
        />

        {/* Background Effects */}
        <div className="bg-[#805c8b] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#000]" />
        <div className="bg-[#CDECFF] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#000]" />

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <main>
              <Header />
              {children}
              <SpeedInsights />
              <Toaster position="top-right" />
              <Footer />
              <ThemeSwitch />
            </main>
          </ActiveSectionContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}

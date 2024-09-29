import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className=" pb-6">
      <div className="my-10 px-4 text-left sm:text-center text-gray-500 w-[80vw] max-w-6xl mx-auto mr-10 sm:mr-auto">
        <small className="mb-2 block text-sm font-semibold">
          &copy; {currentYear} crafted with 💛 by{" "}
          <Link
            href="https://www.linkedin.com/in/selvinpaulraj/"
            className="hover:cursor-pointer hover:underline text-black dark:text-white"
          >
            Selvin PaulRaj 
          </Link>
           . All rights reserved.
        </small>
        <p className="text-sm ">
          <span className="font-semibold">Take off on an Adventure : 
          </span> This website is a masterwork of Next.js and React (with App Router & Server Actions), adorned with TypeScript, customized with Tailwind CSS, animated with Framer Motion, driven with React Email & Resend, and gently hosted on Vercel.
        </p>
      </div>
    </footer>
  );
};
export default Footer;

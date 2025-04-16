"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";
import { FaLinkedin,  FaGithub } from "react-icons/fa";
import { PiButterflyLight } from "react-icons/pi";
import { HiDownload } from "react-icons/hi";
import {FaHackerrank } from "react-icons/fa";
import HeroImg from "../public/profile.jpg";

import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { SiLeetcode,SiGeeksforgeeks  ,SiCodechef } from "react-icons/si";

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const amPm = hours >= 12 ? "PM" : "AM";

      // Convert to 12-hour format
      hours = hours % 12 || 12;

      const formattedTime = `${hours}:${
        minutes < 10 ? "0" : ""
      }${minutes} ${amPm}`;
      setCurrentTime(formattedTime);
    };
    updateTime();

    //* Update time every minute
    const intervalId = setInterval(updateTime, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="mb-28 max-w-[50rem] text-center sm:mb-0 scroll-mt-[100rem] md:scale-150 md:mt-16 md:mb-4"
    >
      <motion.div className="flex items-center justify-center flex-col">
        <motion.h2
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          className="py-4 font-mono text-base text md:text-xl text-center text-gray-800 dark:text-gray-200 mb-2"
        >
          {currentTime}
        </motion.h2>

        <motion.div  >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "tween",
              duration: 0.6,
              delay: 0.4,
            }}
            className="ring-2 rounded-[50%] dark:ring-[#FFD700] ring-gray-900"
          >
            <Image
              src={HeroImg}
              alt="Selvin PaulRaj K"
              width="195"
              height="192"
              quality="95"
              priority={true}
              className="h-36 w-36 rounded-full object-contain shadow-xl pointer-events-none p-1"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.h1
        className="mb-10 mt-4 px-4 text-base font-medium !leading-[1.5] sm:text-base lg:text-[17px] 2xl:text-[20px] w-full sm:w-[60%] mx-auto dark:text-gray-300 dark:font-medium text-center"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Hey there!{" "}
        <span className="hover:underline"> I&apos;m <span className="font-semibold cursor-pointer">Selvin PaulRaj K</span></span> , a versatile Full-Stack Developer from India, thriving in the Remote work Environment as an SDE. My Passion lies in transforming raw concepts into captivating digital experiences that leave a lasting impact. Let&apos;s turn your Ideas into Digital Brilliance! 
      </motion.h1>

      <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 text-lg font-medium">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.a
            href="#contact"
            className="group bg-gray-900  text-white/80 w-[80vw] sm:w-52 py-3 flex items-center justify-center gap-2 rounded-md outline-none focus:scale-110 active:scale-105 transition duration-300 hover:text-white text-sm xl:text-base uppercase text-center font-semibold dark:bg-[#FFD700] dark:text-black"
            onClick={() => {
              setActiveSection("Contact");
              setTimeOfLastClick(Date.now());
            }}
          >
            Get in touch{" "}
            <BsArrowRight className="opacity-70 group-hover:translate-x-1 transition group-hover:opacity-100" />
          </motion.a>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="hidden sm:block"
          drag
        >
          <PiButterflyLight  size={27} className="hover:scale-110 duration-300" />
        </motion.span>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <motion.a
            className="group bg-white w-[80vw] sm:w-52 py-3 flex items-center justify-center gap-2 rounded-md outline-none focus:scale-110 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 text-sm xl:text-base uppercase text-center font-semibold "
            href="/SPR_Resume.pdf"
            download
          >
            Download CV{" "}
            <HiDownload className="opacity-60 group-hover:translate-y-1 transition group-hover:opacity-100" />
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex items-center gap-6 md:hidden mt-4"
        >
          <a
            href="https://www.linkedin.com/in/selvinpaulraj"
            target="_blank"
            className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300 "
          >
            <FaLinkedin size={22} />
          </a>

          <a
            href="https://github.com/selvin-paul-raj"
            target="_blank"
            className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
          >
            <FaGithub size={22} />
          </a>
          <a
        href="https://www.hackerrank.com/profile/selvinpaulraj"
        target="_blank"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <FaHackerrank size={22} />
      </a>
      <a
        href="https://leetcode.com/u/selvinpaulraj/"
        target="_blank"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <SiLeetcode size={22} />
      </a>
      <a
        href="https://www.geeksforgeeks.org/user/selvinpaulrajk/"
        aria-label="geeksforgeeks"
        target="_blank"
        className="bg-transparent  w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <SiGeeksforgeeks  size={22} />
      </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

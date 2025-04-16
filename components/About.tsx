"use client";

import React from "react";
import SectionHeading from "./SectionHeading";
import { motion } from "framer-motion";

import { useSectionInView } from "@/lib/hooks";

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 1 * index,
    },
  }),
};

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[66rem] text-center leading-8 sm:mb-40 scroll-mt-28  "
      initial={{ opacity: 0, y: 100 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading >About</SectionHeading>

      <div className="text-center sm:text-start text-base lg:text-lg font-medium px-2 md:space-y-10">
        <motion.p className="mb-4 md:text-3xl " 
         variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{
              once: false,
            }}>
          <span className="font-bold text-4xl leading-10">I</span> am embarking
          on a transformative journey as a{" "}
          <span className="font-bold underline">INFORMATION TECHNOLOGY  (IT) </span>
          graduate, I&apos;ve woven my passion for web development into the
          fabric of my freelance career. Building and fixing things, especially
          in the dynamic world of the web, bring me genuine joy.
        </motion.p>
        <motion.p className="mb-4 md:text-3xl"  variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{
              once: false,
            }}>
        I specialize in crafting elevated, intuitive, and minimalistic designs
        <span className="font-bold underline">
          {" "}
          for startups and small businesses{" "}
        </span>{" "}
        to help them stand out in the digital landscape with a powerful
        impact.
      </motion.p>

        <motion.p className="mb-4 md:text-3xl"  variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{
              once: false,
            }}>
          <span className="">Beyond crafting websites,</span> I aim to create
          <span className="font-bold underline">
            {" "}
            digital experiences that go beyond the ordinary{" "}
          </span>
          . Every line of code and pixel placement reflects my dedication to
          delivering solutions that exceed expectations. In essence, I&apos;m
          not just a web developer; I&apos;m an architect of digital landscapes,
          a storyteller of brands.
        </motion.p>
  
      </div>
    </motion.section>
  );
}

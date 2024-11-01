"use client";

import React from "react";
import SectionHeading from "./SectionHeading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiencesData } from "@/lib/data";
import { motion } from "framer-motion";
// import { isRouteMatch } from "next/dist/server/future/route-matches/route-match";

import { useTheme } from "@/context/theme-context";
const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * index,
    },
  }),
};

export default function Experience() {
  const { theme } = useTheme();

  const getBackground = () =>
    theme === "light" ? "#f3f4f6" : "rgb(255,255, 255,  0.1)";
  const getBorder = () =>
    theme === "light" ? "2px solid rgba(0,0,0,0.1)" : " 2px solid rgba(255, 255, 255, 0.1)";
  return (

   <section
   id="experience"
   className="mx-auto text-center scroll-mt-[10rem] md:scale-105">
    <SectionHeading >My Experience</SectionHeading>
    <VerticalTimeline lineColor={theme === "light" ? "#000" : "#fff"} className="h-full" >
        {
            experiencesData.map((exp,index)=>(
                <React.Fragment key={index} >
                <VerticalTimelineElement 
                visible
                contentStyle={{
                  backgroundColor:getBackground(),
                    boxShadow: "none",
                    border: getBorder(),
                    textAlign:"left",
                    padding: "1.3rem",
                    
                }}
                date={exp.date}
                icon={exp.icon}
                iconStyle={{
                    background: "#f3f4f6",
                    color:"black",
                    fontSize: "1.5rem",
                }}
                contentArrowStyle={{
                    borderRight: "0.4rem solid #9ca3af"
                }}
                >
                  <motion.div variants={fadeInAnimationVariants} className="flex flex-col ">
                    <h3 className="font-semibold capitalize text-lg">{exp.title}</h3>
                    <p className="underline">{exp.company}</p>
                    <p className="font-normal !mt-0 text-md text-gray-500">{exp.location}</p>
                    <p className="!mt-0 text-sm text-slate-400">{exp.description}</p>
                    </motion.div>
                </VerticalTimelineElement>
                </React.Fragment>
            ))
        }
    </VerticalTimeline>
   </section>
  )
}
import React from "react";
import SectionHeading from "./SectionHeading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiencesData } from "@/lib/data";
import { useTheme } from "@/context/theme-context";
import { motion } from "framer-motion";

export default function Experience() {
  const { theme } = useTheme();

  const getBackground = () =>
    theme === "light" ? "#f3f4f6" : " rgb(0 0 0 / 0.7)";
  const getContentArrowColor = () =>
    theme === "light" ? "#9ca3af" : "rgba(255, 255, 255, 0.5)";
  const getIconBackground = () =>
    theme === "light" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#111827 ";

  // Framer Motion animation variants
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

  // Helper function to convert bullet points to list
  const renderDescription = (description: string) => {
    const lines = description.split("\n").filter(line => line.trim() !== "");
    return (
      <ul className="list-disc list-inside ml-4">
        {lines.map((line, index) => (
          <li key={index} className="text-gray-700 dark:text-white/75">{line.replace("•", "").trim()}</li>
        ))}
      </ul>
    );
  };

  return (
    <motion.section
      id="experience"
      className="scroll-mt-28 mb-28 sm:mb-40"
      variants={fadeInAnimationVariants}
      initial="initial"
      whileInView="animate"
      viewport={{
        once: false,
      }}
    >
      <SectionHeading>My Experience</SectionHeading>
      <VerticalTimeline lineColor={theme === "light" ? "#000" : "#fff"}>
        {experiencesData.map((item, index) => (
          <VerticalTimelineElement
          visible
            key={index}
            contentStyle={{
              background: "transparent",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
              borderRadius: "8px",
              padding: "1.3rem 2rem",
              gap: "30px",
              display: "flex",
              flexDirection: "column",
              border: '1px solid white',
              maxWidth:"1200px",
              backgroundColor:getBackground()
            }}
            contentArrowStyle={{
              borderRight: `0.4rem solid ${getContentArrowColor()}`,
              gap: "20px"
            }}
            date={item.date}
            dateClassName="mx-4"
            icon={item.icon}
            
            iconStyle={{
              background: getIconBackground(),
              color: "#fff",
              borderRadius: "50%",
            }}
          >
            <motion.div variants={fadeInAnimationVariants} className="flex flex-col !m-0">
              <h3 className="font-semibold capitalize text-lg  text-indigo-600 dark:text-indigo-400">{item.title}</h3>
              <p>{item.company}</p>
              <p className="font-normal mt-0 text-sm text-gray-500">{item.location}</p>
              {renderDescription(item.description)}
            </motion.div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </motion.section>
  );
}

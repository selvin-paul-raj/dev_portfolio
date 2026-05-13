"use client";

import React from "react";
import SectionHeading from "./SectionHeading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const paragraphs = [
  <>
    I am an{" "}
    <span className="font-semibold text-gray-900 dark:text-white">AI Engineer</span>{" "}
    from India, pursuing a Master&apos;s in Computer Science (AI specialisation) at Kings
    Engineering College. My foundation is a B.Tech in Information Technology — where I discovered
    my obsession with building systems that think, adapt, and act.
  </>,
  <>
    I specialize in{" "}
    <span className="font-semibold text-gray-900 dark:text-white">
      agentic AI: LangGraph multi-agent pipelines, MCP servers, RAG systems, and LLM-powered
      automation
    </span>
    . I design workflows where multiple AI agents collaborate, reason, and execute tasks
    autonomously — backed by full-stack expertise across Next.js, React, Node.js, and Python.
  </>,
  <>
    At{" "}
    <span className="font-semibold text-gray-900 dark:text-white">Zinnov (Draup)</span>, I build
    AI automation pipelines — embedding-based classification models, multi-step job-role
    intelligence agents, and web-scraping workflows that power research for Fortune 500 clients.
    Outside work, I ship open-source AI tooling: MCP servers, CLI agent systems, and full-stack
    apps that push the edge of what&apos;s possible.
  </>,
];

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      id="about"
      className="mb-28 w-full max-w-3xl mx-auto px-4 scroll-mt-28"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      <SectionHeading>About</SectionHeading>

      {/* Pull-quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.1 }}
        className="py-5 mb-8 border-y border-black/8 dark:border-white/8 italic text-lg sm:text-xl text-gray-700 dark:text-white/70 leading-relaxed"
      >
        &ldquo;I design workflows where AI agents collaborate, reason, and execute.&rdquo;
      </motion.blockquote>

      <div className="space-y-5 text-left">
        {paragraphs.map((para, i) => (
          <motion.p
            key={i}
            className="text-base sm:text-lg text-gray-600 dark:text-white/60 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.38, ease: EASE_OUT, delay: 0.15 * i + 0.2 }}
          >
            {para}
          </motion.p>
        ))}
      </div>
    </motion.section>
  );
}

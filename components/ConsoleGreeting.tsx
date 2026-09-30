"use client";

import { useEffect } from "react";

const MESSAGE = `
  Welcome to Selvin PaulRaj K's Portfolio

  AI Engineer — AI Agents, MCP Servers, RAG Systems, LangGraph Pipelines.
  Based in Chennai, India.

  Portfolio: https://selvinpaulraj.vercel.app
  GitHub: https://github.com/selvin-paul-raj
`;

const STYLES = "color: #bada55; font-size: 14px;";

export default function ConsoleGreeting() {
  useEffect(() => {
    console.log(`%c${MESSAGE}`, STYLES);
  }, []);

  return null;
}

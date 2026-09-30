"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmails";
import { CONTACT_LIMITS } from "@/lib/validation/contactLimits";
import SubmitBtn from "./SubmitBtn";
import toast from "react-hot-toast";
import { FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";
import { HiMail, HiPhone } from "react-icons/hi";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const CONTACT_METHODS = [
  {
    icon: <HiMail size={15} />,
    label: "Email",
    value: "selvinpaulgomathi@gmail.com",
    copyable: true,
    href: null,
  },
  {
    icon: <HiPhone size={15} />,
    label: "Phone",
    value: "+91 91762 99049",
    copyable: false,
    href: "tel:+919176299049",
  },
  {
    icon: <FaWhatsapp size={15} />,
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    copyable: false,
    href: "https://wa.me/+919176299049",
  },
  {
    icon: <FaLinkedin size={15} />,
    label: "LinkedIn",
    value: "in/selvinpaulraj",
    copyable: false,
    href: "https://linkedin.com/in/selvinpaulraj",
  },
  {
    icon: <FaGithub size={15} />,
    label: "GitHub",
    value: "selvin-paul-raj",
    copyable: false,
    href: "https://github.com/selvin-paul-raj",
  },
];

const Contact = () => {
  const { ref } = useSectionInView("Contact", 0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("selvinpaulgomathi@gmail.com");
      toast.success("Email copied!");
    } catch {
      toast.error("Couldn't copy. The address is selvinpaulgomathi@gmail.com");
    }
  };

  return (
    <motion.section
      id="contact"
      ref={ref}
      className="mb-28 scroll-mt-28 w-full max-w-5xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      viewport={{ once: true }}
    >
      <SectionHeading kicker="Hiring for AI engineering, or building agents and MCP tooling? Let's talk.">
        Contact
      </SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left column: info + contact methods */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}
          viewport={{ once: true }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          {/* Availability badge */}
          <div className="flex items-center gap-2.5 font-mono text-xs text-gray-600 dark:text-[#c9c9cf]
            bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.07]
            rounded-full px-4 py-2 w-fit">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-reduce:animate-none animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Open to opportunities
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Let&apos;s build something together
            </h3>
            <p className="text-sm text-gray-600 dark:text-[#c9c9cf] leading-relaxed">
              Whether you have a project in mind, want to explore AI engineering
              collaboration, or just want to connect, I&apos;m always up for a
              conversation.
            </p>
          </div>

          {/* Response time */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#c9c9cf] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518] shrink-0" />
            Typically responds within 24h
          </div>

          {/* Contact methods: one row per channel, icon + label + value */}
          <ul className="flex flex-col divide-y divide-black/[0.08] dark:divide-white/[0.07] rounded-2xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] overflow-hidden">
            {CONTACT_METHODS.map(({ icon, label, value, copyable, href }) => {
              const rowClass =
                "group flex w-full items-center gap-3 px-4 py-3 text-left " +
                "hover:bg-black/[0.03] dark:hover:bg-white/[0.03] active:scale-[0.97] " +
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f5c518]";
              const rowStyle = {
                transition:
                  "background-color 150ms cubic-bezier(0.23,1,0.32,1), transform 150ms cubic-bezier(0.23,1,0.32,1)",
              };
              const inner = (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-gray-600 dark:text-[#c9c9cf]" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-[#a1a1aa]">{label}</span>
                    <span className="truncate text-sm text-gray-900 dark:text-white">{value}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-xs text-gray-500 dark:text-[#a1a1aa] group-hover:translate-x-0.5"
                    style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    {copyable ? "Copy" : "↗"}
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {copyable ? (
                    <button type="button" onClick={handleCopyEmail} aria-label={`Copy email address ${value}`} className={rowClass} style={rowStyle}>
                      {inner}
                    </button>
                  ) : (
                    <a
                      href={href!}
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                      aria-label={`${label}: ${value}${href?.startsWith("http") ? " (opens in new tab)" : ""}`}
                      className={rowClass}
                      style={rowStyle}
                    >
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Right column: form */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
          viewport={{ once: true }}
          className="lg:col-span-3 bg-white dark:bg-[#101015] border border-black/[0.08] dark:border-white/[0.07] rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
            Send a message
          </h3>

          <form
            ref={formRef}
            className="relative flex flex-col gap-4"
            action={async (formData) => {
              const result = await sendEmail(formData);
              if (!result.ok) { toast.error(result.error); return; }
              toast.success("Message sent!");
              formRef.current?.reset();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="senderName" className="font-mono text-xs text-gray-600 dark:text-[#c9c9cf] uppercase tracking-widest">
                  Name
                </label>
                <input
                  id="senderName"
                  name="senderName"
                  type="text"
                  required
                  maxLength={CONTACT_LIMITS.nameMax}
                  autoComplete="name"
                  placeholder="Your name"
                  className="h-11 px-4 rounded-xl
                    bg-gray-50 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07]
                    text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#8a8a93]
                    outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2
                    transition-colors duration-150"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-mono text-xs text-gray-600 dark:text-[#c9c9cf] uppercase tracking-widest">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={CONTACT_LIMITS.emailMax}
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="h-11 px-4 rounded-xl
                    bg-gray-50 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07]
                    text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#8a8a93]
                    outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2
                    transition-colors duration-150"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="font-mono text-xs text-gray-600 dark:text-[#c9c9cf] uppercase tracking-widest">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={CONTACT_LIMITS.messageMin}
                maxLength={CONTACT_LIMITS.messageMax}
                placeholder="Tell me about your project, idea, or just say hi..."
                rows={5}
                className="px-4 py-3 rounded-xl resize-none
                  bg-gray-50 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07]
                  text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#8a8a93]
                  outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2
                  leading-relaxed transition-colors duration-150"
              />
            </div>

            {/* Honeypot: hidden from people and assistive tech; bots that fill it are dropped server-side. */}
            <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
              <label htmlFor="company_website">Company website</label>
              <input
                id="company_website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <SubmitBtn />
          </form>
        </motion.div>
      </div>
    </motion.section>
  );
};
export default Contact;

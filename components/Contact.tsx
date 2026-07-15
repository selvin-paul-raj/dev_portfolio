"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmails";
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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("selvinpaulgomathi@gmail.com");
    toast.success("Email copied!");
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
      <SectionHeading>Contact</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-10">

        {/* Left column: info + contact methods */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}
          viewport={{ once: true }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          {/* Availability badge */}
          <div className="flex items-center gap-2.5 font-mono text-xs text-gray-500 dark:text-white/40
            bg-black/[0.03] dark:bg-white/[0.04] border border-black/6 dark:border-white/8
            rounded-full px-4 py-2 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Open to opportunities
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white/90 mb-2">
              Let&apos;s build something together
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">
              Whether you have a project in mind, want to explore AI engineering
              collaboration, or just want to connect — I&apos;m always up for a
              conversation.
            </p>
          </div>

          {/* Response time */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/60 shrink-0" />
            Typically responds within 24h
          </div>

          {/* Contact methods — compact icon buttons */}
          <div className="flex flex-row flex-wrap gap-2.5">
            {CONTACT_METHODS.map(({ icon, label, copyable, href }) =>
              copyable ? (
                <button
                  key={label}
                  onClick={handleCopyEmail}
                  aria-label={`Copy ${label}`}
                  title={label}
                  className="group flex flex-col items-center justify-center gap-1 px-3.5 py-3 rounded-2xl
                    bg-white dark:bg-white/[0.04] border border-black/6 dark:border-white/8 min-w-[3.5rem]
                    text-gray-500 dark:text-white/40
                    hover:text-gray-900 dark:hover:text-white/85 hover:border-black/15 dark:hover:border-white/15
                    active:scale-[0.97]"
                  style={{ transition: "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1), border-color 130ms ease" }}
                >
                  <span className="text-[1.1rem]">{icon}</span>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-gray-500 dark:text-white/25">{label}</span>
                </button>
              ) : (
                <a
                  key={label}
                  href={href!}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  title={label}
                  className="group flex flex-col items-center justify-center gap-1 px-3.5 py-3 rounded-2xl
                    bg-white dark:bg-white/[0.04] border border-black/6 dark:border-white/8 min-w-[3.5rem]
                    text-gray-500 dark:text-white/40
                    hover:text-gray-900 dark:hover:text-white/85 hover:border-black/15 dark:hover:border-white/15
                    active:scale-[0.97]"
                  style={{ transition: "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1), border-color 130ms ease" }}
                >
                  <span className="text-[1.1rem]">{icon}</span>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-gray-500 dark:text-white/25">{label}</span>
                </a>
              )
            )}
          </div>
        </motion.div>

        {/* Right column: form */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
          viewport={{ once: true }}
          className="lg:col-span-3 bg-white dark:bg-white/[0.04] border border-black/6 dark:border-white/8 rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90 mb-5">
            Send a message
          </h3>

          <form
            className="flex flex-col gap-4"
            action={async (formData) => {
              const { error } = await sendEmail(formData);
              if (error) { toast.error(error); return; }
              toast.success("Message sent!");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.6rem] text-gray-500 dark:text-white/30 uppercase tracking-widest">
                  Name
                </label>
                <input
                  name="senderName"
                  type="text"
                  required
                  maxLength={500}
                  placeholder="Your name"
                  className="h-11 px-4 rounded-xl
                    bg-gray-50 dark:bg-white/[0.06] border border-black/6 dark:border-white/8
                    text-sm text-gray-900 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20
                    outline-none focus:border-[#FFD700]/50 dark:focus:border-[#FFD700]/30
                    transition-colors duration-150"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.6rem] text-gray-500 dark:text-white/30 uppercase tracking-widest">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={500}
                  placeholder="your@email.com"
                  className="h-11 px-4 rounded-xl
                    bg-gray-50 dark:bg-white/[0.06] border border-black/6 dark:border-white/8
                    text-sm text-gray-900 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20
                    outline-none focus:border-[#FFD700]/50 dark:focus:border-[#FFD700]/30
                    transition-colors duration-150"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.6rem] text-gray-500 dark:text-white/30 uppercase tracking-widest">
                Message
              </label>
              <textarea
                name="message"
                required
                maxLength={5000}
                placeholder="Tell me about your project, idea, or just say hi..."
                rows={5}
                className="px-4 py-3 rounded-xl resize-none
                  bg-gray-50 dark:bg-white/[0.06] border border-black/6 dark:border-white/8
                  text-sm text-gray-900 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20
                  outline-none focus:border-[#FFD700]/50 dark:focus:border-[#FFD700]/30
                  leading-relaxed transition-colors duration-150"
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

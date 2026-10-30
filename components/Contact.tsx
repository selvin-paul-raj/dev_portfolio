"use client";

import { useRef, useState } from "react";
import SectionHeading from "./SectionHeading";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmails";
import { CONTACT_LIMITS } from "@/lib/validation/contactLimits";
import SubmitBtn from "./SubmitBtn";
import toast from "react-hot-toast";
import { FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";
import { HiPhone } from "react-icons/hi";
import { LuCheck, LuCopy } from "react-icons/lu";
import { MdArrowOutward } from "react-icons/md";

const EMAIL = "selvinpaulgomathi@gmail.com";

const CHANNELS = [
  { icon: HiPhone, label: "Phone", value: "+91 91762 99049", href: "tel:+919176299049" },
  { icon: FaWhatsapp, label: "WhatsApp", value: "Chat on WhatsApp", href: "https://wa.me/+919176299049" },
  { icon: FaLinkedin, label: "LinkedIn", value: "in/selvinpaulraj", href: "https://linkedin.com/in/selvinpaulraj" },
  { icon: FaGithub, label: "GitHub", value: "selvin-paul-raj", href: "https://github.com/selvin-paul-raj" },
];

const FIELD =
  "w-full px-4 rounded-xl text-base sm:text-sm bg-gray-50 dark:bg-white/[0.06] border border-black/40 dark:border-white/35 " +
  "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#8a8a93] " +
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#101015] " +
  "transition-colors duration-150";
const LABEL = "text-sm font-medium text-gray-700 dark:text-white/75";

type Status = { kind: "ok" | "error"; text: string } | null;

/** The direct ways to reach me, email first. */
function DirectLinks() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Clipboard write failed:", err);
      toast.error(`Couldn't copy. The address is ${EMAIL}`);
    }
  };

  return (
    <div className="lg:col-span-2 flex flex-col gap-8">
      <div>
        <h3 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
          Send the role, or the problem.
        </h3>
        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-[#c9c9cf]">
          Agents, MCP servers, RAG pipelines, or an AI engineering opening. I reply within 24 hours.
        </p>
        <p className="mt-3 text-sm font-medium text-green-700 dark:text-green-400/85">
          Open to AI Engineer roles, based in Chennai, India.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className={LABEL}>Email</span>
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={`mailto:${EMAIL}`}
            className="min-w-0 truncate py-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white underline decoration-accent decoration-2 underline-offset-[6px]
              hover:decoration-[3px] rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {EMAIL}
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label={copied ? "Email address copied" : "Copy email address"}
            title="Copy email address"
            className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/15
              text-gray-600 dark:text-white/65 hover:text-gray-900 dark:hover:text-white hover:border-black/25 dark:hover:border-white/30
              outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-150"
          >
            {copied ? <LuCheck size={16} aria-hidden="true" className="text-green-600 dark:text-green-400" /> : <LuCopy size={16} aria-hidden="true" />}
          </button>
          <span role="status" className="sr-only">{copied ? "Email address copied" : ""}</span>
        </div>
      </div>

      {/* Other channels: plain rows, no card */}
      <ul className="border-t border-black/[0.08] dark:border-white/[0.08]">
        {CHANNELS.map(({ icon: Icon, label, value, href }) => {
          const external = href.startsWith("http");
          return (
            <li key={label} className="border-b border-black/[0.08] dark:border-white/[0.08]">
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-label={`${label}: ${value}${external ? " (opens in new tab)" : ""}`}
                className="group grid grid-cols-[1.25rem_5.5rem_minmax(0,1fr)_1rem] items-center gap-3 py-3.5 min-h-[48px]
                  outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent rounded-sm"
              >
                <Icon size={16} aria-hidden="true" className="text-gray-500 dark:text-white/50 group-hover:text-amber-700 dark:group-hover:text-accent transition-colors duration-150" />
                <span className="text-sm text-gray-500 dark:text-white/50">{label}</span>
                <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                <MdArrowOutward
                  size={15}
                  aria-hidden="true"
                  className="text-gray-400 dark:text-white/35 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-150"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MessageForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [messageLength, setMessageLength] = useState(0);
  const [status, setStatus] = useState<Status>(null);

  return (
    <div className="lg:col-span-3 bg-white dark:bg-[#101015] border border-black/[0.08] dark:border-white/[0.07] rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send a message</h3>
      <p className="mt-1 mb-6 text-sm text-gray-600 dark:text-white/55">It goes straight to my inbox.</p>

      <form
        ref={formRef}
        className="relative flex flex-col gap-5"
        onInput={() => setStatus(null)}
        action={async (formData) => {
          const result = await sendEmail(formData);
          if (!result.ok) {
            setStatus({ kind: "error", text: result.error });
            toast.error(result.error);
            return;
          }
          const from = String(formData.get("email") ?? "").trim();
          setStatus({ kind: "ok", text: `Sent. I'll reply to ${from || "you"} within 24 hours.` });
          toast.success("Message sent");
          formRef.current?.reset();
          setMessageLength(0);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="senderName" className={LABEL}>
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
              className={`${FIELD} h-12`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={LABEL}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              required
              maxLength={CONTACT_LIMITS.emailMax}
              autoComplete="email"
              placeholder="you@company.com"
              className={`${FIELD} h-12`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="message" className={LABEL}>
              Message
            </label>
            <span id="message-count" className="text-xs tabular-nums text-gray-500 dark:text-white/45" aria-live="off">
              {messageLength.toLocaleString()} / {CONTACT_LIMITS.messageMax.toLocaleString()}
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            required
            minLength={CONTACT_LIMITS.messageMin}
            maxLength={CONTACT_LIMITS.messageMax}
            placeholder="The role, the project, or the question"
            rows={6}
            aria-describedby="message-count"
            onChange={(e) => setMessageLength(e.target.value.length)}
            className={`${FIELD} py-3 resize-y min-h-[9rem] leading-relaxed`}
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

        <div className="flex flex-col gap-3">
          <SubmitBtn />
          <p
            role="status"
            className={`min-h-[1.25rem] text-sm ${
              status?.kind === "error" ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-400/85"
            }`}
          >
            {status?.text ?? ""}
          </p>
        </div>
      </form>
    </div>
  );
}

const Contact = () => {
  const { ref } = useSectionInView("Contact", 0);

  return (
    <section id="contact" ref={ref} className="mb-28 scroll-mt-28 w-full max-w-5xl mx-auto px-4">
      <SectionHeading kicker="Hiring for AI engineering, or building agents and MCP tooling? Let's talk.">
        Contact
      </SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
        <DirectLinks />
        <MessageForm />
      </div>
    </section>
  );
};
export default Contact;

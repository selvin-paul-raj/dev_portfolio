"use client";

import { FaPaperPlane } from "react-icons/fa";
import { useFormStatus } from "react-dom";

const SubmitBtn = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group w-full flex items-center justify-between gap-3 pl-6 pr-2 py-2 rounded-full
        bg-gray-900 dark:bg-[#FFD700] text-white dark:text-black
        text-sm font-semibold tracking-wide
        focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 outline-none
        active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
      style={{
        transition: "opacity 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <span>{pending ? "Sending…" : "Send message"}</span>
      <span
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 dark:bg-black/15
          group-hover:scale-110 group-hover:bg-white/25 dark:group-hover:bg-black/25"
        style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease" }}
      >
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white dark:border-black" />
        ) : (
          <FaPaperPlane size={12} />
        )}
      </span>
    </button>
  );
};

export default SubmitBtn;

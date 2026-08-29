"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/audio/engine";

/* ============================================================
   DECLARATIVE TOOL FORM — a visible HTML form the agent can
   actuate natively via the WebMCP Declarative API.
   https://developer.chrome.com/docs/ai/webmcp/declarative-api
   ============================================================ */

interface DeclarativeFormProps {
  toolname: string;
  tooldescription: string;
  /** single text input */
  paramName: string;
  paramDescription: string;
  placeholder?: string;
  submitLabel?: string;
  /** returns a result string (or throws) */
  onExecute: (value: string) => Promise<string> | string;
  className?: string;
}

export default function DeclarativeForm({
  toolname,
  tooldescription,
  paramName,
  paramDescription,
  placeholder,
  submitLabel = "RUN",
  onExecute,
  className,
}: DeclarativeFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // surface agent actuation feedback (per Declarative API spec)
  useEffect(() => {
    const onActivated = (e: Event) => {
      const t = (e as CustomEvent & { toolName?: string })?.toolName;
      if (t && t !== toolname) return;
      sfx.click();
    };
    const onCancel = (e: Event) => {
      const t = (e as CustomEvent & { toolName?: string })?.toolName;
      if (t && t !== toolname) return;
    };
    window.addEventListener("toolactivated", onActivated as EventListener);
    window.addEventListener("toolcancel", onCancel as EventListener);
    return () => {
      window.removeEventListener("toolactivated", onActivated as EventListener);
      window.removeEventListener("toolcancel", onCancel as EventListener);
    };
  }, [toolname]);

  return (
    <form
      ref={formRef}
      {...{ toolname, tooldescription }}
      onSubmit={(e) => {
        const se = e as unknown as SubmitEvent & {
          agentInvoked?: boolean;
          respondWith?: (p: Promise<unknown>) => void;
        };
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const value = String(fd.get(paramName) ?? "").trim();
        if (!value) return;
        if (se.agentInvoked && se.respondWith) {
          e.preventDefault();
          se.respondWith(
            Promise.resolve(onExecute(value)).then((res) => res ?? "done")
          );
          return;
        }
        e.preventDefault();
        void Promise.resolve(onExecute(value));
      }}
      className={className}
    >
      <div className="flex items-center gap-1.5">
        <input
          name={paramName}
          type="text"
          placeholder={placeholder}
          defaultValue=""
          autoComplete="off"
          spellCheck={false}
          {...{ toolparamdescription: paramDescription }}
          className="field-dark flex-1 px-2 py-1 text-[11px]"
        />
        <button type="submit" className="btn-bevel text-[10px] px-2 py-1">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
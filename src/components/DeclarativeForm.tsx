"use client";

import { useEffect } from "react";
import { sfx } from "@/audio/engine";

/* ============================================================
   DECLARATIVE TOOL FORM — a visible HTML form the agent can
   actuate natively via the WebMCP Declarative API.
   https://developer.chrome.com/docs/ai/webmcp/declarative-api

   The form is a single text input + submit. When the host agent
   invokes the tool, the browser supplies `agentInvoked` and
   `respondWith` on the SubmitEvent; we route the result through
   `respondWith` so the agent gets a structured return. When the
   player submits manually, we run the same handler and dispatch
   an internal "form:submitted" event for telemetry — the Chrome
   `toolactivated` event is reserved for the host (it triggers a
   "TOOL ACTIVATED" toast in GameRoot that would be misleading
   on a manual submit).
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
  /** accessible label for the input (defaults to toolname) */
  ariaLabel?: string;
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
  ariaLabel,
}: DeclarativeFormProps) {
  // surface agent actuation feedback (per Declarative API spec).
  // If the host fires a toolactivated event for this form, play a
  // click so the player can hear the desk respond.
  useEffect(() => {
    const onActivated = (e: Event) => {
      const detail = (e as CustomEvent<{ toolName?: string }>).detail;
      if (detail?.toolName && detail.toolName !== toolname) return;
      sfx.click();
    };
    window.addEventListener("toolactivated", onActivated as EventListener);
    return () => window.removeEventListener("toolactivated", onActivated as EventListener);
  }, [toolname]);

  return (
    <form
      {...{ toolname, tooldescription }}
      onSubmit={(e) => {
        const se = e as unknown as SubmitEvent & {
          agentInvoked?: boolean;
          respondWith?: (p: Promise<unknown>) => void;
        };
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const value = String(fd.get(paramName) ?? "").trim();
        if (!value) return;
        e.preventDefault();
        if (se.agentInvoked && se.respondWith) {
          se.respondWith(
            Promise.resolve()
              .then(() => onExecute(value))
              .then((res) => res ?? "done"),
          );
          return;
        }
        // manual submit — notify the world and run the handler
        window.dispatchEvent(new CustomEvent("form:submitted", { detail: { toolName: toolname, value } }));
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
          aria-label={ariaLabel ?? toolname}
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

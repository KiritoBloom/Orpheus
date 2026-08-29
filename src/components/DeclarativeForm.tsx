"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/audio/engine";

/* ============================================================
   DECLARATIVE TOOL FORM — a visible HTML form the agent can
   actuate natively via the WebMCP Declarative API.
   https://developer.chrome.com/docs/ai/webmcp/declarative-api

   Contract implemented here, in spec order:
   - `toolname` + `tooldescription` on the <form>  → registers the tool
   - `toolparamdescription` on the input           → parameter schema
   - `toolautosubmit` on the <form>                → the agent's invocation
     submits without waiting for a human click, so `respondWith` can
     actually return a value to the model
   - `SubmitEvent.agentInvoked` + `respondWith(Promise)` → structured output.
     `preventDefault()` is called BEFORE `respondWith` on every path,
     including validation failures, so an agent-invoked empty submit can
     never fall through to a native navigation
   - window `toolactivated` / `toolcancel` carry `toolName` as a property
     ON THE EVENT — read there, with a `detail` fallback for older builds
   - `:tool-form-active` / `:tool-submit-active` styling, injected from
     src/app/layout.tsx (newer than the build's CSS parser, so it ships
     verbatim behind an @supports guard)
   ============================================================ */

/** Read the tool name off a declarative lifecycle event (spec: event property). */
export function toolNameOf(e: Event): string | undefined {
  return (
    (e as Event & { toolName?: string }).toolName ??
    (e as CustomEvent<{ toolName?: string }>).detail?.toolName
  );
}

interface DeclarativeFormProps {
  toolname: string;
  tooldescription: string;
  /** single text input */
  paramName: string;
  paramDescription: string;
  placeholder?: string;
  submitLabel?: string;
  /** returns a result string for the agent (or throws) */
  onExecute: (value: string) => Promise<string> | string;
  className?: string;
  /** accessible label for the input (defaults to toolname) */
  ariaLabel?: string;
  /** visible label text rendered next to the field (also used for a11y) */
  label?: string;
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
  label,
}: DeclarativeFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Agent actuation feedback: the host fires `toolactivated` on the window once
  // it has filled this form's fields. Play a click so the player hears the desk
  // respond, and only for this form's tool.
  useEffect(() => {
    const onActivated = (e: Event) => {
      const name = toolNameOf(e);
      if (name && name !== toolname) return;
      sfx.click();
    };
    window.addEventListener("toolactivated", onActivated as EventListener);
    return () => window.removeEventListener("toolactivated", onActivated as EventListener);
  }, [toolname]);

  return (
    <form
      ref={formRef}
      // lowercase DOM attributes — React passes unknown lowercase attrs through verbatim
      {...{ toolname, tooldescription, toolautosubmit: "" }}
      onSubmit={(e) => {
        const se = e as unknown as SubmitEvent & {
          agentInvoked?: boolean;
          respondWith?: (p: Promise<unknown>) => void;
        };
        // Always stop the native submit first — required before respondWith,
        // and this form never navigates.
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const value = String(fd.get(paramName) ?? "").trim();

        if (!value) {
          const message = `${paramName} is required — provide a non-empty value.`;
          if (se.agentInvoked && se.respondWith) se.respondWith(Promise.resolve({ ok: false, error: message }));
          return;
        }

        if (se.agentInvoked && se.respondWith) {
          se.respondWith(
            Promise.resolve()
              .then(() => onExecute(value))
              .then((res) => res ?? "done")
              .catch((err) => ({ ok: false, error: err instanceof Error ? err.message : "tool failure" })),
          );
          return;
        }

        // manual submit — notify the world and run the same handler
        window.dispatchEvent(new CustomEvent("form:submitted", { detail: { toolName: toolname, value } }));
        void Promise.resolve(onExecute(value));
      }}
      className={className}
    >
      <div className="flex items-center gap-1.5">
        {label && (
          <label htmlFor={`decl-${toolname}`} className="mono-xs text-faint shrink-0">
            {label}
          </label>
        )}
        <input
          id={`decl-${toolname}`}
          name={paramName}
          type="text"
          placeholder={placeholder}
          defaultValue=""
          autoComplete="off"
          spellCheck={false}
          aria-label={ariaLabel ?? label ?? toolname}
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

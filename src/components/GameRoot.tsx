"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadSave } from "@/game/state/persistence";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { useInvestigation } from "@/game/state/investigationStore";
import { registerWebMCPTools, getModelContext } from "@/webmcp/register";
import { sfx } from "@/audio/engine";
import IrisTitle from "@/components/title/IrisTitle";
import BootSequence from "@/components/boot/BootSequence";
import MissionBriefing from "@/components/boot/MissionBriefing";
import Desktop from "@/components/desktop/Desktop";
import Toasts from "@/components/notifications/Toasts";
import EndingSequence from "@/components/EndingSequence";

/* ============================================================
   GAME ROOT — the machine lifecycle.

   title → boot → briefing → desktop (→ ending → title)

   Owns: phase transitions, persistence hydration, WebMCP
   registration, local-assist enable, store sync, global FX.
   ============================================================ */

export default function GameRoot() {
  const phase = useOS((s) => s.phase);
  const setPhase = useOS((s) => s.setPhase);
  const hydrated = useOS((s) => s.hydrated);
  const settings = useOS((s) => s.settings);
  const flags = useOS((s) => s.flags);
  const hydrate = useOS((s) => s.hydrate);

  const [ready, setReady] = useState(false);
  const [endingRequested, setEndingRequested] = useState(false);
  const audioPrimed = useRef(false);

  /* ---------- persistence hydrate ---------- */
  useEffect(() => {
    void (async () => {
      const save = await loadSave();
      useOS.setState({
        hydrated: true,
        flags: new Set(save.flags),
        settings: save.settings,
        vaultUnlocked: save.unlockedVault,
        vaultAttempts: save.vaultAttempts,
      });
      // ariaStore now only holds status; no chat persistence needed
      useAria.setState({ status: "idle", statusDetail: "" });
      useInvestigation.getState().loadFromSave({
        evidenceIds: save.evidenceIds,
        caseReport: save.caseReport,
        caseVerdicts: save.caseVerdicts,
        caseCompleteAt: save.caseCompleteAt,
      });
      hydrate({ hasProgress: save.hasProgress });
      sfx.setEnabled(save.settings.sound);
      setReady(true);
    })();
  }, [hydrate]);

  /* ---------- webmcp registration (poll for late injection) ---------- */
  // Atlas + Chrome 149 inject async — poll + live toolchange
  useEffect(() => {
    if (!ready) return;
    registerWebMCPTools();
    const id = setInterval(() => {
      if (registerWebMCPTools()) clearInterval(id);
    }, 800);
    const onChange = () => registerWebMCPTools();
    // Re-acquire on each change — initial getModelContext() is often null at hydration
    const attach = () => {
      const mc = getModelContext() as EventTarget | null;
      mc?.addEventListener?.("toolchange", onChange as EventListener);
      return mc;
    };
    let mc = attach();
    // If still null, retry attach after 1.2s (late injection typical for Atlas)
    let attachId: ReturnType<typeof setTimeout> | null = null;
    if (!mc) {
      attachId = setTimeout(() => {
        mc = attach();
      }, 1200);
    }
    return () => {
      clearInterval(id);
      if (attachId) clearTimeout(attachId);
      mc?.removeEventListener?.("toolchange", onChange as EventListener);
      // also try current context in case it changed
      (getModelContext() as EventTarget | null)?.removeEventListener?.("toolchange", onChange as EventListener);
    };
  }, [ready]);

  /* ---------- first-gesture audio prime ---------- */
  useEffect(() => {
    const prime = () => {
      if (audioPrimed.current) return;
      audioPrimed.current = true;
      sfx.ensure();
      if (settings.sound) { sfx.startHum(); }
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
    window.addEventListener("pointerdown", prime, { once: true });
    window.addEventListener("keydown", prime, { once: true });
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, [settings.sound]);

  /* keep hum in sync */
  useEffect(() => {
    if (!audioPrimed.current) return;
    if (settings.sound) sfx.startHum(); else sfx.stopHum();
  }, [settings.sound]);

  /* ---------- investigation → flags cross-sync ---------- */
  useEffect(() => {
    useInvestigation.getState().syncFlags(flags);
  }, [flags]);

  /* also poll: investigation sync on a short interval to catch
     auto-unlock evidence after flags are added outside reactors */
  useEffect(() => {
    const id = setInterval(() => useInvestigation.getState().syncFlags(useOS.getState().flags), 800);
    return () => clearInterval(id);
  }, []);

  /* ---------- the 02:13 window — recurring co-op set piece after the vault ---------- */
  useEffect(() => {
    const id = setInterval(() => {
      void import("@/game/services").then((m) => m.tickObservabilityWindow());
    }, 4000);
    return () => clearInterval(id);
  }, []);

  /* ---------- first desktop entry — greet + auto-open Field Guide ---------- */
  // Desktop entry handled once; avoids re-trigger on settings changes and skips auto-open for returning users.
  const desktopEntryHandled = useRef(false);
  useEffect(() => {
    if (phase !== "desktop" || !ready) {
      if (phase !== "desktop") desktopEntryHandled.current = false;
      return;
    }
    if (desktopEntryHandled.current) return;
    desktopEntryHandled.current = true;
    const os = useOS.getState();
    const alreadyMet = os.flags.has("MET_ARIA");
    const sawGuide = os.flags.has("FOUND_GUIDE");
    const soundOn = useOS.getState().settings.sound;
    const t = setTimeout(async () => {
      if (!alreadyMet && !useOS.getState().flags.has("MET_ARIA")) {
        useAria.getState().setStatus("idle");
        useOS.getState().addFlag("MET_ARIA");
        if (soundOn) sfx.ding();
      }
      // Auto-open Field Guide exactly once per investigation — the promised "file that opens when we first enter the desktop"
      if (!sawGuide && !useOS.getState().flags.has("FOUND_GUIDE")) {
        const { openFile, openApplication } = await import("@/game/services");
        // small stagger so the desktop settles, then guide appears on top
        setTimeout(() => {
          openFile("/System/FIELD_GUIDE.txt");
          if (useOS.getState().settings.sound) sfx.windowOpen();
        }, 500);
        setTimeout(() => {
          // open Files behind it so the player sees the filesystem context
          openApplication("files");
        }, 900);
        // first-time toast that sells the collaboration
        setTimeout(() => {
          useOS.getState().pushToast({
            app: "ARIA",
            title: "FIELD GUIDE OPENED",
            body: "I can search everything. You can see what I cannot. Tell me what you see → watch me move.",
          });
        }, 1400);
      }
      // No else branch: returning investigators choose when to open Files themselves.
    }, 900);
    return () => clearTimeout(t);
  }, [phase, ready]);

  /* ---------- case complete → ending ---------- */
  useEffect(() => {
    const onComplete = () => {
      try { useOS.getState().addFlag("CASE_COMPLETE"); } catch {}
      // give the last ARIA message a moment, then end
      setTimeout(() => setEndingRequested(true), 1600);
    };
    window.addEventListener("orpheus:case-complete" as never, onComplete as never);
    return () => window.removeEventListener("orpheus:case-complete" as never, onComplete as never);
  }, []);

  useEffect(() => {
    if (!endingRequested) return;
    // fade into ending after toasts clear
    const t = setTimeout(() => { setPhase("ending"); sfx.stopHum(); sfx.stopDrone(); }, 900);
    return () => clearTimeout(t);
  }, [endingRequested, setPhase]);

  /* ---------- gentle hint if stuck — no spam, one per phase ---------- */
  useEffect(() => {
    if (phase !== "desktop" || !ready) return;
    const f = useOS.getState().flags;
    if (f.has("CASE_RECONSTRUCTION_AVAILABLE") || f.has("CASE_COMPLETE")) return;
    const hintFor = (): { title: string; body: string } | null => {
      const cur = useOS.getState().flags;
      if (!cur.has("FOUND_GUIDE")) return { title: "START HERE", body: "A guide waits in System — it explains why you need ARIA." };
      if (!cur.has("DISCOVERED_ORPHEUS")) return { title: "THE TILT", body: "Five datasets, one curve. He named it after looking back." };
      if (!cur.has("FOUND_PHOTO_017")) return { title: "LOOK CLOSER", body: "Evening light, a window — zoom. The glass remembers what the eye missed." };
      if (!cur.has("FOUND_0213_LOG")) return { title: "THE HOUR", body: "Clocks, logs, heartbeats — all stop at 02:13. The power log says nothing happened." };
      if (!cur.has("VAULT_OPENED")) return { title: "THREE WORDS", body: "Light → name → echo. Photographed so paper could burn. Order matters." };
      if (!cur.has("IDENTIFIED_CONTACT")) return { title: "WHO VISITED?", body: "A badge turned backwards. Ask ARIA to find where that phrase appears." };
      return null;
    };
    const t = setTimeout(() => {
      const h = hintFor();
      if (h) {
        useOS.getState().pushToast({ app: "HINT", title: h.title, body: h.body });
        sfx.click();
      }
    }, 90000); // 90s idle — generous, not nagging
    return () => clearTimeout(t);
  }, [phase, ready, flags]);

  /* ---------- link hotkey ---------- */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("orpheus:open-link"));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ---------- declarative tool lifecycle ---------- */
  useEffect(() => {
    const onActivated = (e: Event) => {
      const name = (e as unknown as { toolName?: string }).toolName ?? "record_evidence";
      // Visible feedback when agent fills the declarative form (Chrome guide: :tool-form-active)
      useOS.getState().pushToast({ app: "WEBMCP", title: "TOOL ACTIVATED", body: `${name} — agent is filling the form` });
    };
    const onCancel = (e: Event) => {
      const name = (e as unknown as { toolName?: string }).toolName ?? "record_evidence";
      useOS.getState().pushToast({ app: "WEBMCP", title: "TOOL CANCELLED", body: name });
    };
    window.addEventListener("toolactivated" as never, onActivated as never);
    window.addEventListener("toolcancel" as never, onCancel as never);
    return () => {
      window.removeEventListener("toolactivated" as never, onActivated as never);
      window.removeEventListener("toolcancel" as never, onCancel as never);
    };
  }, []);

  /* ---------- phase transitions from title ---------- */
  const handleLaunch = useCallback(
    async (mode: "new" | "continue") => {
      if (mode === "new") {
        // wipe both persistent + live state before leaving title
        const { wipeSave } = await import("@/game/state/persistence");
        await wipeSave();
        // reset mutated data arrays to original unread state
        const { EMAILS: _emails } = await import("@/game/data/emails");
        const origUnread = new Set(["mail_102", "mail_104", "mail_106", "mail_107"]);
        for (const em of _emails) em.unread = origUnread.has(em.id);
        // reset live stores to their empty snapshots
        useOS.setState({
          flags: new Set(),
          vaultUnlocked: false,
          vaultAttempts: 0,
          readMailIds: new Set(),
          readThreadIds: new Set(),
          windows: {
            files: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 60, y: 48, w: 720, h: 470 } },
            mail: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 90, y: 40, w: 820, h: 520 } },
            messages: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 100, y: 54, w: 740, h: 500 } },
            photos: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 80, y: 44, w: 640, h: 480 } },
            browser: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 110, y: 36, w: 780, h: 540 } },
            terminal: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 140, y: 90, w: 640, h: 400 } },
            systemlog: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 100, y: 52, w: 760, h: 500 } },
            evidence: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 130, y: 46, w: 700, h: 520 } },
            textviewer: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 220, y: 80, w: 600, h: 480 } },
            imageviewer: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 240, y: 70, w: 660, h: 520 } },
          },
          focused: null,
          zTop: 10,
          obsWindow: { open: false, endsAt: 0, lastClosedAt: 0 },
          syncStreak: 0,
          syncLastActor: null,
          syncLastAt: 0,
        });
        useAria.setState({ status: "idle", statusDetail: "" });
        useInvestigation.setState({ evidenceIds: new Set(["ev_daniel"]), caseReport: {}, caseVerdicts: {}, caseCompleteAt: null });
        sfx.ensure();
        setPhase("boot");
      } else {
        sfx.ensure();
        setPhase("desktop");
        // Files + guide handling lives in the first-desktop-entry effect
      }
    },
    [setPhase]
  );

  if (!ready || !hydrated) {
    return (
      <div className="fixed inset-0 bg-black grid place-items-center">
        <span className="mono-xs text-dim tracking-[0.3em]">INITIALIZING INTERFACE…</span>
      </div>
    );
  }

  const crtOn = settings.crt;
  const reduced = settings.reducedMotion;

  return (
    <div
      className={`fixed inset-0 bg-black overflow-hidden ${!crtOn ? "crt-off" : ""} ${reduced ? "reduce-motion" : ""} ${settings.textScale === "lg" ? "data-textscale-lg" : ""}`}
      data-textscale={settings.textScale}
    >
      {/* CRT */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {phase === "title" && <IrisTitle onLaunch={handleLaunch} />}

      {phase === "boot" && <BootSequence onDone={() => setPhase("briefing")} />}

      {phase === "briefing" && (
        <MissionBriefing
          onDone={() => {
            setPhase("desktop");
          }}
        />
      )}

      {phase === "desktop" && <Desktop />}

      {phase === "ending" && (
        <EndingSequence
          onDone={() => {
            // reset to title, but keep save as archived
            setPhase("title");
            setEndingRequested(false);
          }}
        />
      )}

      {/* always-on toasts — hidden behind title's own vignette but fine */}
      {phase === "desktop" && <Toasts />}

      {/* ---------- declarative WebMCP tool — https://developer.chrome.com/docs/ai/webmcp/declarative-api ---------- */}
      {/* Both imperative + declarative per best practices. Uses toolname/tooldescription/toolparamdescription + agentInvoked/respondWith. Offscreen but focusable so :tool-form-active outline shows when agent invokes. */}
      <form
        id="webmcp-declarative-evidence"
        {...({ toolname: "record_evidence", tooldescription: "Record evidence via form — alternative to record_evidence tool" } as unknown as React.FormHTMLAttributes<HTMLFormElement>)}
        onSubmit={(e) => {
          const se = e as unknown as SubmitEvent & { agentInvoked?: boolean; respondWith?: (p: Promise<unknown>) => void };
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const id = String(fd.get("evidenceId") || "").trim();
          if (!id) return;
          if (se.agentInvoked && se.respondWith) {
            e.preventDefault();
            const p = import("@/game/services").then((S) => S.recordEvidenceById(id));
            se.respondWith(p);
            return;
          }
          e.preventDefault();
          void import("@/game/services").then((S) => S.recordEvidenceById(id));
        }}
        // Offscreen but not display:none so browser can focus and apply :tool-form-active (Chrome declarative guide)
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
        aria-hidden
      >
        <input name="evidenceId" type="hidden" defaultValue="ev_daniel" {...({ toolparamdescription: "Evidence id, e.g. ev_0213_login" } as unknown as React.InputHTMLAttributes<HTMLInputElement>)} />
        <button type="submit" style={{ display: "none" }} tabIndex={-1} aria-hidden>Submit</button>
      </form>
    </div>
  );
}

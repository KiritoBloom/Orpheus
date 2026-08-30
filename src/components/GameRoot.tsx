"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadSave } from "@/game/state/persistence";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { useInvestigation } from "@/game/state/investigationStore";
import { registerWebMCPTools, getModelContext, getRegistrationState } from "@/webmcp/register";
import { readDemoConfig, isDemoEntry, applyDemoConfig, demoBanner, type DemoConfig } from "@/game/demo";
import { activeCorpus } from "@/game/data/corpus";
import { sfx } from "@/audio/engine";
import IrisTitle from "@/components/title/IrisTitle";
import BootSequence from "@/components/boot/BootSequence";
import MissionBriefing from "@/components/boot/MissionBriefing";
import Desktop from "@/components/desktop/Desktop";
import Toasts from "@/components/notifications/Toasts";
import EndingSequence from "@/components/EndingSequence";
import EventFlash from "@/components/EventFlash";
import { Aperture } from "@/components/Aperture";

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
  const [curtain, setCurtain] = useState(0); // bumped per phase arrival so the aperture opens on it
  const audioPrimed = useRef(false);
  const demoRef = useRef<DemoConfig | null>(null);
  const demoAnnounced = useRef(false);

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
        readMailIds: new Set(save.readMailIds ?? []),
        readThreadIds: new Set(save.readThreadIds ?? []),
      });
      // ariaStore now only holds status; no chat persistence needed
      useAria.setState({ status: "idle", statusDetail: "" });
      useInvestigation.getState().loadFromSave({
        // a fresh save carries no evidence; seed from the active corpus
        evidenceIds: save.evidenceIds.length ? save.evidenceIds : activeCorpus().seedEvidenceIds,
        caseReport: save.caseReport,
        caseVerdicts: save.caseVerdicts,
        caseCompleteAt: save.caseCompleteAt,
      });
      hydrate({ hasProgress: save.hasProgress });
      sfx.setEnabled(save.settings.sound);

      // ?demo= / ?skip= — preload state and land on the desktop. Flags are set
      // with setState, never addFlag, so a judge's shortcut is not persisted
      // over a player's save. See src/game/demo.ts.
      const cfg = readDemoConfig();
      if (isDemoEntry(cfg)) {
        await applyDemoConfig(cfg);
        demoRef.current = cfg;
        setCurtain((c) => c + 1);
        useOS.getState().setPhase("desktop");
      }
      setReady(true);
    })();
  }, [hydrate]);

  /* ---------- demo entry — banner, and the LINK console for ?demo=verify ---------- */
  useEffect(() => {
    const cfg = demoRef.current;
    if (!ready || phase !== "desktop" || !cfg || demoAnnounced.current) return;
    demoAnnounced.current = true;
    const banner = demoBanner(cfg);
    const t = setTimeout(() => {
      if (banner) useOS.getState().pushToast({ app: "DEMO", ...banner });
      if (cfg.mode === "verify") window.dispatchEvent(new CustomEvent("orpheus:open-link"));
    }, 1200);
    return () => clearTimeout(t);
  }, [ready, phase]);

  /* ---------- webmcp registration (poll + toolchange re-register) ---------- */
  // Hosts inject `document.modelContext` asynchronously (Atlas notably late),
  // and may replace or clear the tool set — so registration is idempotent per
  // context and re-runs on every `toolchange`.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const attach = (mc: EventTarget | null) => {
      mc?.addEventListener?.("toolchange", onChange as EventListener);
      return mc;
    };
    const onChange = () => {
      if (!cancelled) void registerWebMCPTools();
    };

    let attached: EventTarget | null = attach(getModelContext());
    void registerWebMCPTools();

    // Poll until every tool is registered against a live context, re-attaching
    // the toolchange listener if the context appears (or is swapped) later.
    const id = setInterval(() => {
      if (cancelled) return;
      const mc = getModelContext() as EventTarget | null;
      if (mc && mc !== attached) {
        attached?.removeEventListener?.("toolchange", onChange as EventListener);
        attached = attach(mc);
      }
      void registerWebMCPTools().then((ok) => {
        if (ok && getRegistrationState().registered) clearInterval(id);
      });
    }, 800);

    return () => {
      cancelled = true;
      clearInterval(id);
      attached?.removeEventListener?.("toolchange", onChange as EventListener);
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

  /* ---------- the unexplained message — a thread arrives while you read the desk ---------- */
  useEffect(() => {
    if (phase !== "desktop") return;
    if (useOS.getState().flags.has("MYSTERY_MESSAGE")) return;
    const id = setTimeout(() => {
      const os = useOS.getState();
      if (os.phase !== "desktop" || os.flags.has("MYSTERY_MESSAGE")) return;
      os.addFlag("MYSTERY_MESSAGE");
      os.pushToast({
        app: "MESSAGES",
        title: "NEW MESSAGE — NO SENDER",
        body: "Received while you were reading the desk. It answers nothing.",
      });
      sfx.mysteryArrive();
      window.dispatchEvent(new CustomEvent("orpheus:event-flash", { detail: { tone: "cold" } }));
    }, 110_000 + Math.random() * 30_000);
    return () => clearTimeout(id);
  }, [phase]);

  /* ---------- the observability window — recurring co-op set piece after the vault ---------- */
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
        const guidePath = activeCorpus().guidePath;
        // small stagger so the desktop settles, then guide appears on top
        setTimeout(() => {
          openFile(guidePath);
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
        // Judge verification hint — surfaces once, points to the no-host 30s path
        setTimeout(() => {
          useOS.getState().pushToast({
            app: "ARIA",
            title: "JUDGE? 30-SEC PATH",
            body: "Tray → LINK → ⚡ QUICK VERIFY — 9 evals + 3 tool calls (incl. show_in_document, which pins a persistent highlight). No host needed.",
          });
        }, 3000);
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
    /* The ladder is the corpus's: offer the first nudge whose flag is still
       missing. No investigation-specific strings live in this component. */
    const hintFor = (): { title: string; body: string } | null => {
      const cur = useOS.getState().flags;
      const entry = activeCorpus().guidance.hintChain.find((h) => !cur.has(h.flag));
      return entry ? { title: entry.title, body: entry.body } : null;
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

  /* ---------- declarative tool lifecycle — agent fills a form ---------- */
  // Per the Declarative API, `toolactivated` fires on the window once the agent
  // has pre-filled a form's fields, and `toolcancel` when it aborts or resets.
  // Both carry `toolName` as a property ON THE EVENT (not in `detail`).
  useEffect(() => {
    const nameOf = (e: Event) =>
      (e as Event & { toolName?: string }).toolName ??
      (e as CustomEvent<{ toolName?: string }>).detail?.toolName ??
      "tool";
    const onActivated = (e: Event) => {
      useOS.getState().pushToast({
        app: "WEBMCP",
        title: "TOOL ACTIVATED",
        body: `${nameOf(e)} — agent is filling the form`,
      });
    };
    const onCancel = (e: Event) => {
      useOS.getState().pushToast({ app: "WEBMCP", title: "TOOL CANCELLED", body: nameOf(e) });
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
        useInvestigation.setState({ evidenceIds: new Set(activeCorpus().seedEvidenceIds), caseReport: {}, caseVerdicts: {}, caseCompleteAt: null });
        sfx.ensure();
        setCurtain((c) => c + 1);
        setPhase("boot");
      } else {
        sfx.ensure();
        setCurtain((c) => c + 1);
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

      {phase === "boot" && <BootSequence onDone={() => { setCurtain((c) => c + 1); setPhase("briefing"); }} />}

      {phase === "briefing" && (
        <MissionBriefing
          onDone={() => {
            setCurtain((c) => c + 1);
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

      {/* the shutter opens on whatever phase just mounted — one continuous optic */}
      {curtain > 0 && phase !== "title" && <Aperture key={curtain} dir="in" />}

      {/* cinematic event moments — dim + amber rim on mystery messages & the window */}
      <EventFlash />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";

const links = [
  ["Home", "#home"],
  ["About", "#approach"],
  ["Work", "#work"],
  ["What we do", "#services"],
  ["Contact", "#contact"],
];

export default function Navigation({homePage=true}:{homePage?:boolean}) {
  const navigationLinks=links.map(([label,href])=>[label,homePage?href:href==="#work"?"/work":"/"+href]);
  const [open, setOpen] = useState(false);
  const pendingSection = useRef<string | null>(null);
  const cancelScroll = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelScroll.current?.(), []);

  function scrollToSection(href: string) {
    const section = document.getElementById(href.slice(1));
    if (!section) return;
    cancelScroll.current?.();
    // Prepare the focus target; focus it only after the scroll finishes.
    if (!section.hasAttribute("tabindex")) {
      section.setAttribute("tabindex", "-1");
      section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
    }
    const start = window.scrollY;
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const end = Math.max(0, Math.min(start + section.getBoundingClientRect().top - padding,
      document.documentElement.scrollHeight - window.innerHeight));
    {
      // Explicit easing keeps section navigation consistent across browsers.
      let frame = 0;
      const began = performance.now();
      const duration = Math.min(1100, Math.max(700, Math.abs(end - start) * .45));
      const cancel = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("wheel", cancel);
        window.removeEventListener("touchstart", cancel);
        window.removeEventListener("keydown", cancel);
        cancelScroll.current = null;
      };
      cancelScroll.current = cancel;
      window.addEventListener("wheel", cancel, { passive: true });
      window.addEventListener("touchstart", cancel, { passive: true });
      window.addEventListener("keydown", cancel);
      const step = (now: number) => {
        const progress = Math.min(1, (now - began) / duration);
        const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: start + (end - start) * eased, behavior: "instant" });
        if (progress < 1) frame = requestAnimationFrame(step);
        else {
          cancel();
          section.focus({ preventScroll: true });
          // Update the URL only after the animation so router updates cannot interrupt it.
          if (window.location.hash !== href) window.history.pushState(window.history.state, "", href);
        }
      };
      frame = requestAnimationFrame(step);
    }
  }

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string, mobile = false) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(href.slice(1))) return;
    event.preventDefault();
    event.stopPropagation();
    if (mobile) {
      pendingSection.current = href;
      setOpen(false);
    } else {
      scrollToSection(href);
    }
  }

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64.001rem)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return <>
    <nav className="desktop-navigation" aria-label="Main navigation">
      {navigationLinks.map(([label, href]) => <a key={href} href={href} onClick={event => navigate(event, href)}>{label}</a>)}
    </nav>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="mobile-menu-trigger" aria-label="Open navigation menu">
        <Menu size={26} strokeWidth={2} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent className="mobile-navigation-panel" overlayClassName="mobile-navigation-overlay" showCloseButton={false}
        onCloseAutoFocus={event => {
          const href = pendingSection.current;
          if (!href) return;
          event.preventDefault();
          pendingSection.current = null;
          // Wait until the sheet has released its focus trap and scroll lock.
          requestAnimationFrame(() => scrollToSection(href));
        }}>
        <SheetHeader className="mobile-navigation-heading">
          <SheetTitle className="wordmark">Ontwrp<span>.</span></SheetTitle>
          <SheetDescription className="sr-only">Navigate the Ontwrp website.</SheetDescription>
        </SheetHeader>
        <SheetClose className="mobile-menu-close" aria-label="Close navigation menu">
          <X size={26} aria-hidden="true" />
        </SheetClose>
        <nav className="mobile-navigation-links" aria-label="Mobile navigation">
          {navigationLinks.map(([label, href]) => <a key={href} href={href} onClick={event => navigate(event, href, true)}>{label}</a>)}
        </nav>
      </SheetContent>
    </Sheet>
  </>;
}

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

  function scrollToSection(href: string) {
    const section = document.getElementById(href.slice(1));
    if (!section) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Transfer keyboard focus without causing an instant jump before the scroll.
    if (!section.hasAttribute("tabindex")) {
      section.setAttribute("tabindex", "-1");
      section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
    }
    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
    if (window.location.hash !== href) window.history.pushState(window.history.state, "", href);
  }

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string, mobile = false) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(href.slice(1))) return;
    event.preventDefault();
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

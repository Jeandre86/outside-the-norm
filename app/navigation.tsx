"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";

const links = [
  ["Home", "#home"],
  ["About", "#approach"],
  ["Work", "#work"],
  ["What we do", "#services"],
  ["Contact", "#contact"],
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64.001rem)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return <>
    <nav className="desktop-navigation" aria-label="Main navigation">
      {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
    </nav>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="mobile-menu-trigger" aria-label="Open navigation menu">
        <Menu size={26} strokeWidth={2} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent className="mobile-navigation-panel" showCloseButton={false}>
        <SheetHeader className="mobile-navigation-heading">
          <SheetTitle className="wordmark">Ontwrp<span>.</span></SheetTitle>
          <SheetDescription className="sr-only">Navigate the Ontwrp website.</SheetDescription>
        </SheetHeader>
        <SheetClose className="mobile-menu-close" aria-label="Close navigation menu">
          <X size={26} aria-hidden="true" />
        </SheetClose>
        <nav className="mobile-navigation-links" aria-label="Mobile navigation">
          {links.map(([label, href]) => <SheetClose asChild key={href}><a href={href}>{label}</a></SheetClose>)}
        </nav>
      </SheetContent>
    </Sheet>
  </>;
}

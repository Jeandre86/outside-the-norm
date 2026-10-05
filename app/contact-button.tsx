"use client";
import Contact from "./contact";
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
export default function ContactButton({label}:{label:string}){return <Dialog><DialogTrigger className="cta">{label}</DialogTrigger><DialogContent className="contact-dialog"><DialogHeader><DialogTitle>Let’s make something that lasts.</DialogTitle><DialogDescription>Tell us about your business and what you have in mind.</DialogDescription></DialogHeader><Contact/></DialogContent></Dialog>}

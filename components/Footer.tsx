import Link from "next/link";
import { Globe, Mail, Smartphone, Search } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#141414] py-16 px-4 md:px-12 text-muted-foreground">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex space-x-6 text-white">
          <Globe className="h-6 w-6 cursor-pointer hover:text-primary transition" />
          <Mail className="h-6 w-6 cursor-pointer hover:text-primary transition" />
          <Smartphone className="h-6 w-6 cursor-pointer hover:text-primary transition" />
          <Search className="h-6 w-6 cursor-pointer hover:text-primary transition" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-4">
            <Link href="#" className="hover:underline block">Audio and Subtitles</Link>
            <Link href="#" className="hover:underline block">Media Center</Link>
            <Link href="#" className="hover:underline block">Privacy</Link>
            <Link href="#" className="hover:underline block">Contact Us</Link>
          </div>
          <div className="space-y-4">
            <Link href="#" className="hover:underline block">Audio Description</Link>
            <Link href="#" className="hover:underline block">Investor Relations</Link>
            <Link href="#" className="hover:underline block">Legal Notices</Link>
          </div>
          <div className="space-y-4">
            <Link href="#" className="hover:underline block">Help Center</Link>
            <Link href="#" className="hover:underline block">Jobs</Link>
            <Link href="#" className="hover:underline block">Cookie Preferences</Link>
          </div>
          <div className="space-y-4">
            <Link href="#" className="hover:underline block">Gift Cards</Link>
            <Link href="#" className="hover:underline block">Terms of Use</Link>
            <Link href="#" className="hover:underline block">Corporate Information</Link>
          </div>
        </div>

        <div className="pt-8">
          <button className="border border-muted-foreground px-2 py-1 text-xs hover:text-white transition">
            Service Code
          </button>
        </div>

        <div className="text-[10px]">
          © 2026-2027 Ankiflix, Inc. Built for Medical, Law, and Polyglot Superhumans.
        </div>
      </div>
    </footer>
  );
}

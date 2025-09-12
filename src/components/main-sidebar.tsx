
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Thermometer, Users, Tractor, Menu, Sparkles, Heart, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SkyraLogo } from "./skyra-logo";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/forecast", label: "Forecast", icon: Thermometer },
  { href: "/members", label: "Members", icon: Users },
  { href: "/companion", label: "Daily Companion", icon: Sparkles },
  { href: "/suggestions", label: "Smart Farming", icon: Tractor },
  { href: "/health", label: "Health & Safety", icon: Heart },
  { href: "/event-planner", label: "Event Planner", icon: CalendarDays },
];

export function MainSidebar() {
  const pathname = usePathname();

  const navContent = (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            pathname === item.href ? "text-primary bg-muted" : "text-muted-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <div className="hidden border-r bg-muted/40 md:flex md:flex-col md:w-64 md:fixed md:h-full">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <SkyraLogo className="h-8 w-8" />
              <span className="text-xl">Skyra</span>
            </Link>
          </div>
          <div className="flex-1">
            {navContent}
          </div>
        </div>
      </div>
      <div className="hidden md:block w-64" /> 
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden sticky top-0 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <SkyraLogo className="h-8 w-8" />
                <span className="text-xl">Skyra</span>
              </Link>
            </div>
            {navContent}
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}

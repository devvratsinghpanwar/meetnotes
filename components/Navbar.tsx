// components/Navbar.tsx
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import { ModeToggle } from './ThemeToggle';


const Navbar = () => {
  return (
    <header className="backdrop-blur card-glass border-b border-border/60 shadow-xs sticky top-0 z-40 transition-colors">
      <nav className="flex items-center justify-between h-16 px-4 md:px-8">
        <Link href="/" className="font-bold text-xl tracking-tight text-primary hover:text-secondary-foreground transition-colors">
          MeetNotes <span className="text-emerald-500 dark:text-emerald-300">AI</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle />
          <SignedIn>
            <Button variant="new" asChild className="hidden sm:inline-flex">
              <Link href="/summaries">My Summaries</Link>
            </Button>
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                avatarBox: "ring-2 ring-primary/70 hover:ring-primary-foreground transition-all"
              }
            }} />
          </SignedIn>
          <SignedOut>
            <Button asChild variant="default" className="ml-2">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
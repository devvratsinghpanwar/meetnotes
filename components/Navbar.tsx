// components/Navbar.tsx
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import { ModeToggle } from './ThemeToggle';

const Navbar = () => {
  return (
    <header className='shadow'>
      <nav className='flex items-center justify-between h-16 px-4 md:px-6'>
        <Link href='/' className='font-bold text-lg'>
          MeetNotes AI
        </Link>
        <div className='flex items-center gap-4'>
          <ModeToggle />
          <SignedIn>
            {/* New "My Summaries" button for signed-in users */}
            <Button variant="default" asChild>
              <Link href="/summaries">My Summaries</Link>
            </Button>
            <UserButton afterSignOutUrl='/' />
          </SignedIn>
          <SignedOut>
            <Button asChild>
              <Link href='/sign-in'>Sign In</Link>
            </Button>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
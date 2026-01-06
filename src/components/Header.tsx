// "use client";

// import React from "react";
// import Link from "next/link";
// import { WebsiteIcon } from "./low-level/icons";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Menu, WifiOff } from "lucide-react";

// const Header: React.FC = () => {
//   const navLinks = [
//     { href: "/view", label: "Tables" },
//     { href: "/study", label: "Study" },
//     { href: "/sets", label: "Sets" },
//     { href: "/login", label: "Login" },
//   ];

//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container mx-auto px-4 h-12 flex items-center justify-between">
//         {/* Logo/Icon Section */}
//         <div className="flex items-center gap-4">
//           <Link
//             href="/"
//             className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
//           >
//             <WebsiteIcon
//               width={32}
//               height={32}
//               className="text-primary"
//               stroke="currentColor"
//             />
//             <span className="text-xl font-bold tracking-tight">LangLearn</span>
//           </Link>
//         </div>

//         {/* Desktop Navigation Links */}
//         <nav className="hidden md:flex items-center space-x-6">
//           {navLinks.map((link) => (
//             <Link
//               key={link.href}
//               href={link.href}
//               className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
//             >
//               {link.label}
//             </Link>
//           ))}
//         </nav>

//         {/* Mobile Menu */}
//         <div className="md:hidden">
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="icon">
//                 <Menu className="h-6 w-6" />
//                 <span className="sr-only">Toggle menu</span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="right">
//               <div className="flex flex-col space-y-4 mt-8">
//                 {navLinks.map((link) => (
//                   <Link
//                     key={link.href}
//                     href={link.href}
//                     className="text-lg font-medium transition-colors hover:text-primary"
//                   >
//                     {link.label}
//                   </Link>
//                 ))}
//                 {/** Login/ Session Check display Icon
//                  *  // we will check if the user has an active session
//                  *  THe API will return req.session.userId on valid session, without it that means no active session
//                  *  If no Active session, show login icon/<Link> like normal
//                  */}
//                 <Link
//                   href="/login"
//                   className="mt-4 flex items-center space-x-2 text-lg font-medium transition-colors hover:text-primary"
//                 >
//                   <WifiOff className="h-5 w-5" />
//                   <span>Login</span>
//                 </Link>

//               </div>
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
"use client";

import React from "react";
import Link from "next/link";
import { WebsiteIcon } from "./low-level/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, WifiOff, User, LogOut } from "lucide-react";
import { useAuth } from "./AuthSession";

const Header: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const isAuthenticated = user?.authenticated || false;

  const navLinks = [
    { href: "/view", label: "Tables" },
    { href: "/study", label: "Study" },
    { href: "/sets", label: "Sets" },
  ];

  const handleLogout = () => {
    logout();
  };

  const AuthSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>User {user?.userId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-1"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      );
    }

    return (
      <Link
        href="/login"
        className="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-primary"
      >
        <span>Login</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo/Icon Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <WebsiteIcon
              width={32}
              height={32}
              className="text-primary"
              stroke="currentColor"
            />
            <span className="text-xl font-bold tracking-tight">LangLearn</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              {link.label}
            </Link>
          ))}
          <AuthSection />
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4">
                  <AuthSection />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

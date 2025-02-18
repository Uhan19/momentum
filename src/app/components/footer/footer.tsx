'use client';

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full flex justify-center items-center p-4 mt-auto border-t">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Momentum. All rights reserved.
      </p>
    </footer>
  );
};

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-semibold">ServiceHub</div>
          <p className="mt-2 text-sm text-muted-foreground">Book trusted local professionals for anything, in minutes.</p>
        </div>
        <div>
          <div className="text-sm font-semibold">For customers</div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Browse services</li><li>How it works</li><li>Trust & safety</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">For providers</div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Become a pro</li><li>Provider guide</li><li>Success stories</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Company</div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>About</li><li>Contact</li><li>Careers</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} ServiceHub</div>
    </footer>
  );
}

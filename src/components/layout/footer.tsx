export function Footer() {
  return (
    <footer style={{ background: "#192b5a", color: "#93b4d4" }} className="py-8 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white"
                style={{ background: "#72bf40" }}
              >
                BOBS
              </div>
              <span className="text-white font-semibold text-sm">Bureau of Standards</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#93b4d4" }}>
              Promoting standardisation, quality infrastructure, and consumer protection in Botswana.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white mb-2">Quick Links</p>
            <ul className="space-y-1 text-xs">
              {[
                ["https://bobstandards.bw", "BOBS Website"],
                ["https://bobstandards.bw/standards", "Standards Catalogue"],
                ["https://bobstandards.bw/certification", "Certification Schemes"],
                ["https://bobstandards.bw/laboratory", "Laboratory Services"],
              ].map(([href, label]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener" className="hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white mb-2">Contact</p>
            <ul className="space-y-1 text-xs">
              <li>Private Bag BO 48, Bontleng</li>
              <li>Gaborone, Botswana</li>
              <li><a href="tel:+26731700851" className="hover:text-white transition-colors">+267 317 0085</a></li>
              <li><a href="mailto:info@bobstandards.bw" className="hover:text-white transition-colors">info@bobstandards.bw</a></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }} className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} Botswana Bureau of Standards. All rights reserved.</p>
          <p>
            <a href="https://bobstandards.bw" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              bobstandards.bw
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

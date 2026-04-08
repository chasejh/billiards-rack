"use client";

const SOCIALS = [
  { label: "Spotify", href: "https://open.spotify.com/artist/1CbXtqHQ0rnhrOjxqKRyL4", icon: "https://static.wixstatic.com/media/11062b_e44dc14ec801433e81ba6501051ebba2~mv2.png/v1/fill/w_20,h_20,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_e44dc14ec801433e81ba6501051ebba2~mv2.png" },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/jess-chase/1747558932", icon: "https://static.wixstatic.com/media/11062b_4cf85f8d931c417280d993ecf42cadaf~mv2.png/v1/fill/w_20,h_20,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_4cf85f8d931c417280d993ecf42cadaf~mv2.png" },
  { label: "TikTok", href: "http://tiktok.com/@jessicachase", icon: "https://static.wixstatic.com/media/11062b_ad1a1e62a5bb45c7835a3ec11d5188f2~mv2.png/v1/fill/w_20,h_20,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_ad1a1e62a5bb45c7835a3ec11d5188f2~mv2.png" },
  { label: "Youtube", href: "https://www.youtube.com/@jess_chase", icon: "https://static.wixstatic.com/media/11062b_f67ec9c36d8a431eabf904a991d9647f~mv2.png/v1/fill/w_20,h_20,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_f67ec9c36d8a431eabf904a991d9647f~mv2.png" },
  { label: "Instagram", href: "https://www.instagram.com/jesschase.wav", icon: "https://static.wixstatic.com/media/11062b_6e9638ad803e4099a6116eb750b5a584~mv2.png/v1/fill/w_20,h_20,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_6e9638ad803e4099a6116eb750b5a584~mv2.png" },
] as const;

export function Footer() {
  return (
    <footer className="w-full shrink-0 border-t border-[#2d5c16] bg-[#38761d]/95 backdrop-blur-sm mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <p className="text-white text-center text-sm order-2 sm:order-1">
          Made with real billiards samples by{" "}
          <a
            href="https://www.jesschase.com/about"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:text-[#ffcc00] transition-colors"
          >
            Jess Chase
          </a>
        </p>
        <ul className="flex list-none p-0 m-0 gap-2 order-1 sm:order-2" aria-label="Social links">
          {SOCIALS.map(({ label, href, icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="block p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <img
                  src={icon}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

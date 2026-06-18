import React from 'react';

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Curriculum', href: '#curriculum' },
      { label: 'Sustainability', href: '#sustainability' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '#contact' },
      { label: 'Help Center', href: '#support' },
      { label: 'Terms of Service', href: '#terms' },
    ],
  },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.99h-2.54v-2.888h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.888h-2.33V21.88C18.343 21.128 22 16.99 22 12Z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M22.162 5.656c-.793.352-1.645.588-2.538.694a4.44 4.44 0 0 0 1.95-2.455 8.877 8.877 0 0 1-2.814 1.075 4.422 4.422 0 0 0-7.531 4.03 12.546 12.546 0 0 1-9.1-4.61 4.421 4.421 0 0 0 1.368 5.905 4.39 4.39 0 0 1-2.004-.554v.056a4.423 4.423 0 0 0 3.546 4.335 4.453 4.453 0 0 1-1.192.159c-.292 0-.577-.028-.854-.08a4.426 4.426 0 0 0 4.133 3.069 8.868 8.868 0 0 1-5.493 1.894c-.357 0-.71-.021-1.057-.062a12.52 12.52 0 0 0 6.782 1.988c8.138 0 12.587-6.742 12.587-12.587 0-.192-.004-.384-.013-.575a8.998 8.998 0 0 0 2.208-2.294Z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.84 2.06a.75.75 0 0 1 .75.75v1.12a.75.75 0 0 1-1.5 0V6.31a.75.75 0 0 1 .75-.75Zm-4.09 1.22a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M20.447 20.452H17.2v-5.682c0-1.354-.025-3.1-1.89-3.1-1.89 0-2.18 1.476-2.18 3.0v5.782H10.05V9h3.112v1.561h.045c.434-.823 1.495-1.69 3.076-1.69 3.289 0 3.894 2.166 3.894 4.982v6.599ZM6.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Zm1.579 13.019H4.757V9h3.159v11.452ZM22.225 0H1.771C.792 0 0 .775 0 1.732v20.535C0 23.225.792 24 1.771 24h20.451C23.206 24 24 23.225 24 22.267V1.732C24 .775 23.206 0 22.225 0Z"/>
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#CFE2D5] bg-[linear-gradient(180deg,#EEF7F1_0%,#E1EFE6_100%)] px-4 py-7 text-[#1E3322] shadow-[0_-10px_24px_rgba(23,32,42,0.05)] md:px-8 md:py-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        <div className="footer-reveal grid gap-7 md:gap-8 lg:grid-cols-[1.15fr_0.9fr_1fr] lg:items-start">
          <div className="max-w-xl">
            <span className="text-2xl font-bold tracking-wide text-[#0A3D25]">Neoकर्म</span>
            <p className="mt-2.5 max-w-lg text-sm leading-6 text-[#4E6256]">
              Helping students measure climate impact and turn awareness into practical school-wide action.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#0A3D25]">
                  {column.title}
                </span>
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group w-fit text-[13px] text-[#52665B] transition-all duration-200 hover:translate-x-1 hover:text-[#0A3D25]"
                  >
                    <span className="bg-gradient-to-r from-[#5C8A72] to-[#5C8A72] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                      {link.label}
                    </span>
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="max-w-sm lg:justify-self-end lg:border-l lg:border-[#C9D8CF] lg:pl-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0A3D25]">
              Connect with us
            </span>
            <p className="mt-2.5 text-sm leading-6 text-[#4E6256]">
              Follow our journey on social media and stay inspired by student-led sustainability stories.
            </p>
            <div className="mt-4 flex gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#C9D8CF] bg-white/70 text-[#0A3D25] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#8DB79D] hover:bg-[#0A3D25] hover:text-white"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#C9D8CF] pt-4 text-[12px] text-[#5D6F60] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Neo Karma. All rights reserved.</p>
          <p className="flex max-w-xl items-start gap-2 text-[13px] font-medium leading-6 text-[#4E6256] md:justify-end md:text-right">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5C8A72]" aria-hidden="true" />
            <span>
              Students cannot change what they cannot see.
              <span className="block text-center font-semibold text-[#4E6256]">
                <span className="font-bold text-[#0A3D25]">Neoकर्म</span> helps them see it.
              </span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

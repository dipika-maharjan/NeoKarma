import React from 'react';
import Image from 'next/image';
import earthIcon from '../../public/earth.png';
import leafIcon from '../../public/leaf.png';
import groupIcon from '../../public/group.png';

const LandingFooter = () => {
  return (
    <footer className="w-full bg-[#f4f8f5] px-6 pb-8 pt-9 text-[#1E3322] md:px-9">
      <div className="mx-auto max-w-[1720px]">
        <div className="mb-8 flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-[900px]">
            <span className="mb-5 block text-[36px] font-extrabold tracking-wide text-[#063f2f]">
              Neoकर्म
            </span>
            <p className="max-w-[900px] text-[21px] font-medium leading-8 text-[#65746d]">
              Empowering students for a greener future. We are dedicated to providing the
              tools needed for the next generation of climate leaders, fostering a community
              rooted in sustainability and conscious innovation.
            </p>
          </div>

          <div className="flex items-center gap-5 md:pt-7">
            {[
              { icon: earthIcon, alt: 'Global' },
              { icon: leafIcon, alt: 'Sustainability' },
              { icon: groupIcon, alt: 'Community' },
            ].map((item) => (
              <div
                key={item.alt}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf3ef] transition hover:bg-[#e0e8e3]"
              >
                <Image src={item.icon} alt={item.alt} className="h-7 w-7 object-contain" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 pb-12 pt-6 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#198653]">
              Explore
            </span>
            <a href="#features" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              About Us
            </a>
            <a href="#sustainability" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Sustainability Report
            </a>
            <a href="#curriculum" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Curriculum
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#198653]">
              Resources
            </span>
            <a href="#support" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Support
            </a>
            <a href="#contact" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Contact
            </a>
            <a href="#forum" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Community Forum
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#198653]">
              Legal
            </span>
            <a href="#privacy" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Privacy Policy
            </a>
            <a href="#terms" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Terms of Service
            </a>
            <a href="#cookies" className="text-[17px] font-medium text-[#65746d] no-underline hover:text-[#063f2f]">
              Cookie Policy
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#198653]">
              Stay Connected
            </span>
            <div className="flex max-w-[420px] items-center rounded-md border border-[#cbd6d0] bg-[#f1f5f2] p-1.5">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent px-4 py-3 text-[16px] text-gray-700 outline-none placeholder:text-gray-400"
              />
              <button className="rounded-md bg-[#078450] px-7 py-3 text-[16px] font-bold text-white transition hover:bg-[#066f43]">
                Join
              </button>
            </div>
            <p className="text-[13px] font-bold tracking-wide text-[#9aa39f]">
              Receive monthly climate insights.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#d9e0dc] pt-8 text-[15px] font-bold text-[#66756e] sm:flex-row">
          <p>© 2026 Neo Karma. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[#0b8c56]">
            <span className="text-lg">▲</span>
            <span>10,432 Trees Planted by our Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

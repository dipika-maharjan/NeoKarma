import React from 'react';
// Direct imports with relative path jumping up two levels to root
import earthIcon from '../../public/earth.png';
import leafIcon from '../../public/leaf.png';
import groupIcon from '../../public/group.png';

const Footer = () => {
  return (
    <footer className="w-full bg-[#F6F8F6] text-[#1E3322] pt-14 pb-8 px-4 md:px-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Top Branding & Social Utility Icon Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="text-2xl font-bold text-[#0A3D25] tracking-wide">
              Neoकर्म
            </span>
            <p className="text-[13px] text-gray-500 leading-relaxed font-normal">
              Empowering students for a greener future. We are dedicated to providing the tools needed for the next generation of climate leaders, fostering a community rooted in sustainability and conscious innovation.
            </p>
          </div>

          {/* Top-Right Round Pill Icons matched exactly to your prototype design */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            
            {/* Globe Icon Container */}
            <div className="w-11 h-11 rounded-full bg-[#EFF2F0] flex items-center justify-center hover:bg-[#E2E6E3] cursor-pointer transition-colors shadow-none">
              <img 
                src={earthIcon.src || earthIcon} 
                alt="Global" 
                className="w-5 h-5 object-contain"
              />
            </div>

            {/* Leaf Icon Container */}
            <div className="w-11 h-11 rounded-full bg-[#EFF2F0] flex items-center justify-center hover:bg-[#E2E6E3] cursor-pointer transition-colors shadow-none">
              <img 
                src={leafIcon.src || leafIcon} 
                alt="Sustainability" 
                className="w-5 h-5 object-contain"
              />
            </div>

            {/* Community Group Icon Container */}
            <div className="w-11 h-11 rounded-full bg-[#EFF2F0] flex items-center justify-center hover:bg-[#E2E6E3] cursor-pointer transition-colors shadow-none">
              <img 
                src={groupIcon.src || groupIcon} 
                alt="Community" 
                className="w-5 h-5 object-contain"
              />
            </div>

          </div>
        </div>

        {/* Links Navigation Grid System */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-6 pb-12">
          
          {/* EXPLORE Link Set */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-[#0A3D25] tracking-widest uppercase">
              Explore
            </span>
            <a href="#about" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">About Us</a>
            <a href="#sustainability" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Sustainability Report</a>
            <a href="#curriculum" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Curriculum</a>
          </div>

          {/* RESOURCES Link Set */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-[#0A3D25] tracking-widest uppercase">
              Resources
            </span>
            <a href="#support" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Support</a>
            <a href="#contact" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Contact</a>
            <a href="#forum" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Community Forum</a>
          </div>

          {/* LEGAL Link Set */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-[#0A3D25] tracking-widest uppercase">
              Legal
            </span>
            <a href="#privacy" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Privacy Policy</a>
            <a href="#terms" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Terms of Service</a>
            <a href="#cookies" className="text-[13px] text-gray-500 hover:text-[#0A3D25] font-normal transition-colors">Cookie Policy</a>
          </div>

          {/* STAY CONNECTED Custom Input Form Frame */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#0A3D25] tracking-widest uppercase mb-1">
              Stay Connected
            </span>
            <div className="flex items-center bg-[#EAECE9] border border-gray-200 rounded-xl p-1 w-full max-w-xs focus-within:border-[#0A3D25]/40 transition-all">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent text-xs text-gray-700 placeholder-gray-400 pl-3 pr-2 py-2 flex-grow outline-none w-full"
              />
              <button className="bg-[#0A3D25] hover:bg-[#0D5232] text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors">
                Join
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Receive monthly climate insights.
            </p>
          </div>

        </div>

        {/* Lower Base Signature Grid (Divider + Copyright + Tree Counter badge) */}
        <div className="border-t border-gray-300 pt-6 flex flex-col sm:flex-row justify-between items-center text-[12px] text-gray-500 font-normal gap-3">
          <p>© 2026 Neo Karma. All rights reserved.</p>
          
          {/* Tree Summary Segment */}
          <div className="flex items-center gap-1.5 text-[#0A3D25] font-medium">
            <span className="text-base leading-none">🌲</span>
            <span className="font-semibold text-gray-800">10,432</span> Trees Planted by our Students
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const pathname = usePathname();
  const authPages = ["/signin", "/signup", "/forgot-pass"];
  if (authPages.includes(pathname)) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-secondary to-[#30134d] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="flex items-center justify-center">
            <h2 className="text-white text-5xl font-bold">Syssel</h2>
          </div>

          {/* Services Column 1 */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">Digital Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services/web-development" className="text-gray-300 hover:text-white transition-colors">Web Development</Link></li>
              <li><Link href="/services/app-development" className="text-gray-300 hover:text-white transition-colors">App Development</Link></li>
              <li><Link href="/services/digital-marketing" className="text-gray-300 hover:text-white transition-colors">Digital Marketing</Link></li>
              <li><Link href="/services/seo" className="text-gray-300 hover:text-white transition-colors">SEO Services</Link></li>
              <li><Link href="/services/content-creation" className="text-gray-300 hover:text-white transition-colors">Content Creation</Link></li>
            </ul>
          </div>

          {/* Services Column 2 */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">Skilled Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services/plumbing" className="text-gray-300 hover:text-white transition-colors">Plumbing</Link></li>
              <li><Link href="/services/electrical" className="text-gray-300 hover:text-white transition-colors">Electrical Work</Link></li>
              <li><Link href="/services/carpentry" className="text-gray-300 hover:text-white transition-colors">Carpentry</Link></li>
              <li><Link href="/services/cleaning" className="text-gray-300 hover:text-white transition-colors">Cleaning Services</Link></li>
              <li><Link href="/services/landscaping" className="text-gray-300 hover:text-white transition-colors">Landscaping</Link></li>
            </ul>
          </div>

          {/* Contact & Social Icons Column */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">Contact Us</h3>
            <p className="text-gray-300 mb-2">123 Service Street</p>
            <p className="text-gray-300 mb-2">Business District, BZ 12345</p>
            <p className="text-gray-300 mb-4">(123) 456-7890</p>
            
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/30 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {currentYear} Syssel. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

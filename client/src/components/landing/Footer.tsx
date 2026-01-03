import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-gray-800 bg-gray-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Brand - Left Side */}
          <div className="flex-1">
            <div className='flex items-center gap-2'>
              <img src="/src/assets/movevm.png" alt="MoveVM" className="h-6 mb-4" />
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                MoveVM
              </h3>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              The no-CLI platform that makes Movement Network smart contract development
              accessible to everyone. Build, deploy, and manage Move contracts with ease.
            </p>
          </div>

          {/* Right Side - Created by, Resources, Quick Links */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Created By Section */}
            <div>
              <h4 className="text-white font-semibold mb-4">Created by</h4>
              <div className="space-y-4">

                {/* Shlok Khairnar */}
                <div>
                  <p className="text-gray-300 font-medium mb-2 text-sm">Shlok Khairnar</p>
                  <div className="flex items-center space-x-3">
                    <a
                      href="https://twitter.com/ShlokKhairnar33"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href="https://github.com/SHLOK333"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com/in/shlok-khairnar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {/* Dev Bhangale */}
                <div>
                  <p className="text-gray-300 font-medium mb-2 text-sm">Dev Bhangale</p>
                  <div className="flex items-center space-x-3">
                    <a
                      href="https://twitter.com/bhangale_dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href="https://github.com/devbh04"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com/in/dev-bhangale"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://docs.movementnetwork.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                  >
                    Movement Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://movementnetwork.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                  >
                    Movement Network
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/movementlabsxyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                  >
                    Movement Labs GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#demo" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MoveVM. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Built with <Heart className="w-4 h-4 text-yellow-400 fill-yellow-400" /> by them for Movement Network
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://github.com/encode-club-m1-hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-2"
              title="Project GitHub"
            >
              <span>Project Repository</span> <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};


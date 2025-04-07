import React from 'react';
import { Camera, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Sandphoto</h1>
              <p className="text-sm text-gray-500">在线证件照排版工具</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <a
              href="https://github.com/ivyswen/sandphoto-react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <Github className="h-5 w-5 mr-1" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}; 
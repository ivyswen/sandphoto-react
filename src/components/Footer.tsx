import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center text-gray-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>by</span>
            <a
              href="https://github.com/ivyswen"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-500 hover:text-blue-600"
            >
              Ivy Wen
            </a>
          </div>
          
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Sandphoto. All rights reserved.
          </div>
          
          <div className="flex space-x-4 text-sm text-gray-500">
            <a
              href="#"
              className="hover:text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://github.com/ivyswen/sandphoto-react/issues', '_blank');
              }}
            >
              问题反馈
            </a>
            <span>·</span>
            <a
              href="#"
              className="hover:text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://github.com/ivyswen/sandphoto-react#readme', '_blank');
              }}
            >
              使用说明
            </a>
            <span>·</span>
            <a
              href="#"
              className="hover:text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://github.com/ivyswen/sandphoto-react/blob/main/LICENSE', '_blank');
              }}
            >
              开源协议
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 
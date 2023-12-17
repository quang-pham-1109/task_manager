'use client';
import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import CustomLink from './CustomLink';

const Header = () => {
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLogged(true);
    }
  }, []);

  function logout() {
    console.log('logout');
    localStorage.removeItem('token');
    setIsLogged(false);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex flex-row justify-between items-center overflow-hidden h-16 p-4 bg-white text-black">
      <div className="flex flex-row items-center justify-center">
        {!isLogged && (
          <a className="" href="/">
            <Image alt="Logo" height={88} src="/betterLogo.svg" width={88} />
          </a>
        )}
        {!isLogged && (
          <CustomLink
            containerStyles="font-bold text-2xl ml-2"
            route="/"
            title="Tasking"
          />
        )}
      </div>
      {!isLogged && (
        <div className="flex gap-4">
          <CustomLink
            containerStyles="bg-black text-white px-4 py-2 font-bold rounded-full hover:bg-zinc-700"
            route="/login"
            title="Login"
          />
          <CustomLink
            containerStyles="text-black px-4 py-2 font-medium rounded-full hover:bg-gray-100"
            route="/register"
            title="Register"
          />
        </div>
      )}
      {isLogged && (
        <div className="flex gap-4">
          <CustomLink
            containerStyles="bg-black text-white px-4 py-2 font-bold rounded-full hover:bg-zinc-700"
            route="/projects"
            title="Projects"
          />
          {/* <button onClick={logout} > */}
          <CustomLink
            click={logout}
            containerStyles="text-black px-4 py-2 font-medium rounded-full hover:bg-gray-100"
            route="/"
            title="Logout"
          />
          {/* </button> */}
        </div>
      )}
    </div>
  );
};

export default Header;

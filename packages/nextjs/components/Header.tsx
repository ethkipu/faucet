"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { BanknotesIcon, Bars3Icon, BugAntIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Faucet",
    href: "/",
    icon: <BanknotesIcon className="w-4 h-4" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <UserGroupIcon className="w-4 h-4" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="w-4 h-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};
/**
 * Site header
 */
export const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const { address: connectedAddress } = useAccount();

  const { data: owner }: { data: any } = useScaffoldReadContract({
    contractName: "Faucet",
    functionName: "owner",
  });

  useEffect(() => {
    if (owner == connectedAddress) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [owner, connectedAddress]);

  return (
    <div className="sticky top-0 z-20 justify-between flex-shrink-0 min-h-0 px-0 shadow-md lg:static navbar bg-base-100 shadow-secondary sm:px-2">
      <div className="w-auto navbar-start lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <button
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </button>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="p-2 mt-3 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              {isAdmin && <HeaderMenuLinks />}
            </ul>
          )}
        </div>
        <Link href="/" passHref className="items-center hidden gap-2 ml-4 mr-6 lg:flex shrink-0">
          <div className="relative flex w-[145px] h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" sizes="100%" priority />
          </div>
          {/* <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div> */}
        </Link>
        <ul className="hidden gap-2 px-1 lg:flex lg:flex-nowrap menu menu-horizontal">
          {isAdmin && <HeaderMenuLinks />}
        </ul>
      </div>
      <div className="flex-grow mr-4 navbar-end">
        <RainbowKitCustomConnectButton />
        {/* <FaucetButton /> */}
      </div>
    </div>
  );
};

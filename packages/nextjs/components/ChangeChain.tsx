"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { scrollSepolia, sepolia } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetworks } from "~~/utils/scaffold-eth/networks";

export function ChangeChain() {
  const { switchChain } = useSwitchChain();
  const modalRef = useRef<HTMLDialogElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { targetNetwork } = useTargetNetwork();
  const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);
  const { address } = useAccount();

  const clickChain = (chainId: number) => {
    if (address) switchChain({ chainId });
    else {
      const newTargetNetwork = getTargetNetworks().find(network => network.id === chainId);
      if (newTargetNetwork) {
        setTargetNetwork(newTargetNetwork);
        close();
      }
    }
  };

  useOutsideClick(modalBoxRef, () => {
    if (isOpen) {
      close();
    }
  });

  useEffect(() => {
    if (isOpen) {
      close();
    }
  }, [targetNetwork]);

  const close = () => {
    setIsOpen(false);
    modalRef?.current?.close();
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const buttonClass =
    "rounded-xl justify-between font-[700] text-lg h-[50px] border-solid border-2 hover:border-primary";

  return (
    <>
      {mounted && (
        <>
          <span className="flex flex-col items-center">
            <span className="absolute flex text-sm text-center mt-[-20px]">Cambiar de Red</span>
            <button
              className="w-[140px] h-[60px] btn btn-primary btn-sm text-center flex flex-row items-center"
              onClick={() => {
                setIsOpen(true);
                modalRef?.current?.showModal();
              }}
            >
              {targetNetwork.id == scrollSepolia.id && (
                <span className="flex flex-row gap-2 text-2xl align-middle">
                  <img src="/images/logo-scroll.png" width={30} alt="Imagen 2" className="object-contain" />
                  <span className="">Scroll</span>
                </span>
              )}
              {targetNetwork.id == sepolia.id && (
                <span className="flex flex-row gap-2 text-2xl align-middle">
                  <img
                    src="/images/ethereum-logo.png"
                    alt="Imagen 3"
                    width={30}
                    className="object-contain rounded-lg ml-[-5px]"
                  />{" "}
                  <span className="">Sepolia</span>
                </span>
              )}
            </button>
          </span>

          {/* Modal */}
          <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
            <div
              ref={modalBoxRef}
              className={`modal-box relative w-full sm:w-[360px] max-w-xl max-h-[90vh] overflow-y-auto transform rounded-t-3xl md:rounded-3xl border-[1px] p-[16px] text-left shadow-xl transition-all flex flex-col gap-5 sidebar text-foreground/90 justify-self-center`}
              style={{
                fontFamily:
                  "SFRounded, ui-rounded, SF Pro Rounded, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
              }}
            >
              <button
                type="button"
                className="absolute z-10 p-1 rounded-full top-4 right-4 w-fit bg-muted hover:scale-[1.15] active:scale-[1] text-muted-foreground border-[1px]"
                onClick={() => {
                  close();
                }}
              >
                <IoMdClose className="w-[18px] h-[18px]" />
              </button>
              <div className="font-[800] text-[20px] sm:text-[18px] leading-[24px] pl-[8px] pt-[4px] text-center sm:text-left">
                Cambiar de Red
              </div>
              <div className="w-full mt-0 modal-action">
                <div className="flex flex-col w-full gap-1 text-foreground">
                  <button
                    className={`${buttonClass} ${
                      targetNetwork.id === sepolia.id && "bg-primary text-white shadow-md border-primary"
                    }`}
                    onClick={() => clickChain(sepolia.id)}
                  >
                    <span className="flex flex-row gap-2 text-xl">
                      <img src="/images/ethereum-logo.png" alt="Imagen 3" width={30} className="object-contain ml-2" />{" "}
                      Ethereum Sepolia
                    </span>
                  </button>
                  <button
                    className={`${buttonClass} ${
                      targetNetwork.id === scrollSepolia.id && "bg-primary text-white shadow-md border-primary"
                    }`}
                    onClick={() => clickChain(scrollSepolia.id)}
                  >
                    <span className="flex flex-row gap-2 text-xl">
                      <img src="/images/logo-scroll.png" width={30} alt="Imagen 2" className="object-contain ml-2" />{" "}
                      Scroll Sepolia
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </dialog>
          {/* End Modal */}
        </>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useTheme } from "next-themes";
// import ReCAPTCHA from "react-google-recaptcha";
import {
  Address as AddressType,
  WriteContractReturnType,
  createWalletClient,
  formatEther,
  http,
  parseEther,
  parseGwei,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
// import {
//  hardhat, // holesky,
//   scrollSepolia,
//   sepolia
// } from "viem/chains";
import { usePublicClient, useWriteContract } from "wagmi";
import { ChangeChain } from "~~/components/ChangeChain";
// import { WriteContractReturnType } from "wagmi/actions";
import { AddressInput } from "~~/components/scaffold-eth";
import {
  useScaffoldReadContract,
  useTargetNetwork,
  useTransactor,
} from "~~/hooks/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

// import { useGlobalState } from "~~/services/store/store";
// import { getTargetNetworks } from "~~/utils/scaffold-eth/networks";

const indexAccount = Math.floor(Math.random() * 11);
const accounts = [
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY1}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY2}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY3}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY4}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY5}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY6}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY7}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY8}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY9}`),
  privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY10}`),
];
const Home: NextPage = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress]: any = useState();

  const { targetNetwork } = useTargetNetwork();

  // const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);

  // const publicClient = usePublicClient({ chainId: hardhat.id });
  const publicClient = usePublicClient({ chainId: targetNetwork.id });

  const localWalletClient: any = createWalletClient({
    chain: publicClient?.chain,
    account: accounts[indexAccount],
    transport: http(getAlchemyHttpUrl(targetNetwork.id)),
    // transport: http(getAlchemyHttpUrl(scrollSepolia.id)),
    //  transport: http(`https://sepolia-rpc.scroll.io`),
    // transport: http(), //Para Hardhat
  });

  // Importe por solicitud

  const { data: dailyLimit } = useScaffoldReadContract({
    contractName: "Faucet",
    functionName: "dailyLimit",
    watch: true,
  });

  const [dailyLimitValue, setDailyLimitValue] = useState("0");

  useEffect(() => {
    if (!dailyLimit) return;
    const value = formatEther(dailyLimit);
    setDailyLimitValue(value);
  }, [dailyLimit]);

  const { writeContractAsync } = useWriteContract();

  const { data: Faucet } = useScaffoldContract({
    contractName: "Faucet",
    walletClient: localWalletClient,
  });

  const faucetTxn = useTransactor(localWalletClient);

  const transaction = async (): Promise<WriteContractReturnType> => {
    return await writeContractAsync({
      abi: Faucet?.abi as any,
      address: Faucet?.address as any,
      functionName: "requestWithdraw",
      args: [inputAddress.trim(), parseEther(dailyLimitValue)],
      account: accounts[indexAccount],
      gas: 500000n,
      gasPrice: parseGwei("7")
    });
  };

  const sendETH = async () => {
    setLoading(true);
    if (!inputAddress || dailyLimitValue == "0") {
      setLoading(false);
      return;
    }
    try {
      await faucetTxn(transaction, {
        blockConfirmations: 1,
        onBlockConfirmation: async (txnReceipt: any) => {
          console.log(txnReceipt);
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  // const recaptchaRef = useRef<ReCAPTCHA>(null);
  // const [isVerified, setIsVerified] = useState(false);

  // async function handleCaptchaSubmission(token: string | null) {
  //   try {
  //     if (token) {
  //       await fetch("/api", {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ token }),
  //       });
  //       setIsVerified(true);
  //     }
  //   } catch (e) {
  //     setIsVerified(false);
  //   }
  // }

  // const handleChange = (token: string | null) => {
  //   handleCaptchaSubmission(token);
  // };

  // function handleExpired() {
  //   setIsVerified(false);
  // }

  return (
    <div
      className={`container flex flex-col items-center self-center w-full px-4 mt-2 ${
        mounted && resolvedTheme === "dark" ? "text-white" : "text-indigo-400"
      }`}
    >
      <div className="flex flex-col flex-grow w-full mt-8 mb-4 md:w-5/6 lg:w-4/5">
        <div className="space-y-8">
          <div className="flex flex-col justify-between overflow-hidden border-2 max-w-5/6 sm:flex-row rounded-xl border-primary shadow-custom-left-lg bg-neutral-content">
            <div className="flex flex-col justify-between w-full p-6 lg:w-1/2">
              <div>
                <h2 className="mb-4 text-5xl font-black">Kipu Faucet</h2>
                <p className="mb-6 text-xl font-bold">
                  Recibe {dailyLimitValue} ETH en la testnet de {targetNetwork.name} para tus ejercicios del Ethereum
                  Developer Pack de ETH Kipu
                </p>
              </div>

              <div className="flex gap-4 mt-4">
                <img
                  src="/images/logo-secondary.svg"
                  alt="Imagen 1"
                  className="object-contain w-[120px] sm:w-[150px]"
                />
                <ChangeChain />
              </div>
            </div>
            <div className="flex-col justify-end hidden lg:flex">
              <Image
                src="/images/illustration.svg"
                alt="Imagen principal"
                width={400}
                height={240}
                className="self-end object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-8">
            <AddressInput
              placeholder="Ingresa tu address o tu ENS"
              value={inputAddress ?? ""}
              onChange={value => setInputAddress(value as AddressType)}
              name="addressFaucet"
            />
            {/* <div>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                ref={recaptchaRef}
                onChange={handleChange}
                onExpired={handleExpired}
              /> 
            </div>*/}
            <div>
              <button
                className="flex items-center justify-center w-full h-16 px-10 text-xl rounded-lg btn btn-primary btn-sm"
                onClick={sendETH}
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner loading-sm"></span>}
                <span>Envíame ETH</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

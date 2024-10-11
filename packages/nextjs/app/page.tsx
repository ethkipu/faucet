"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";
import type { NextPage } from "next";
import { useTheme } from "next-themes";
import { Address as AddressType, createWalletClient, formatEther, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  //  hardhat, // holesky,
  scrollSepolia,
} from "viem/chains";
import { useAccount, useWriteContract } from "wagmi";
import { usePublicClient } from "wagmi";
import { WriteContractReturnType } from "wagmi/actions";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldReadContract, useTransactor } from "~~/hooks/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const account = privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`);
const Home: NextPage = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress]: any = useState();

  const { address: connectedAddress } = useAccount();

  // const publicClient = usePublicClient({ chainId: hardhat.id });
  const publicClient = usePublicClient({ chainId: scrollSepolia.id });

  const localWalletClient: any = createWalletClient({
    chain: publicClient?.chain,
    account,
    transport: http(getAlchemyHttpUrl(scrollSepolia.id)),
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
      account,
    });
  };

  const sendETH = async () => {
    setLoading(true);
    if (!inputAddress) {
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

  const {
    data: withdrawalEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
    refetch: refetchWithdrawalEvents,
  } = useScaffoldEventHistory({
    contractName: "Faucet",
    eventName: "Withdrawal",
    fromBlock: 6951976n, // scrollSepolia
    // fromBlock: 0n, // hardhat
    blockData: true,
    watch: true,
    filters: { _user: connectedAddress ?? "" },
  });

  useEffect(() => {
    refetchWithdrawalEvents();
  }, [connectedAddress]);

  dayjs.extend(relativeTime);
  dayjs.locale("es");

  return (
    <div
      className={`flex flex-col items-center self-center w-full px-4 mt-2 ${
        mounted && resolvedTheme === "dark" ? "text-white" : "text-indigo-400"
      }`}
    >
      <div className="mb-2 text-3xl font-bold text-center">Faucet ETH Kipu - Scroll Sepolia</div>
      <div className="mb-4 text-xl">
        Recibe {dailyLimitValue} ETH para tus ejercicios del Ethereum Developer Pack de ETH Kipu
      </div>
      <div className="flex flex-col flex-grow w-full mb-4 md:w-5/6 lg:w-4/5 xl:w-3/5">
        <div className="space-y-3">
          <div className="flex flex-col space-y-3">
            <AddressInput
              placeholder="Ingresa tu address o tu ENS"
              value={inputAddress ?? ""}
              onChange={value => setInputAddress(value as AddressType)}
              name="addressFaucet"
            />
            <button className="h-10 px-2 rounded-full btn btn-primary btn-sm" onClick={sendETH} disabled={loading}>
              {!loading ? (
                <BanknotesIcon className="w-6 h-6" />
              ) : (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              <span>Envíame ETH</span>
            </button>
          </div>
        </div>
      </div>
      {isLoadingEvents ? (
        <div className="mt-8 text-xl font-bold text-center">Cargando Transacciones...</div>
      ) : (
        <div className="flex flex-col justify-center flex-grow w-full mt-6 mb-4 md:w-5/6 lg:w-4/5 xl:w-3/5">
          <div className="my-2 text-xl font-bold text-center">
            {connectedAddress ? "Transacciones a tu cuenta" : "Últimas Transacciones"}
          </div>
          <div className="overflow-x-auto shadow-2xl rounded-xl">
            <table className="table w-full bg-base-100 table-zebra">
              <thead>
                <tr className="rounded-xl">
                  <th className="bg-primary text-primary-content">n°</th>
                  <th className="bg-primary text-primary-content">Tx</th>
                  <th className="bg-primary text-primary-content">Monto</th>
                  <th className="bg-primary text-primary-content">Cuando</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalEvents &&
                  withdrawalEvents.slice(0, 5)?.map((event: any, index: number) => {
                    return (
                      <tr key={index}>
                        <th>{withdrawalEvents?.length - index}</th>

                        <td className="text-blue-500">
                          <a
                            href={`https://sepolia.scrollscan.com/tx/${event.transactionHash}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="lg:hidden" title={event?.transactionHash}>
                              {event?.transactionHash.slice(0, 6)}...{event?.transactionHash.slice(-4)}
                            </span>
                            <span className="hidden lg:table-cell">{event?.transactionHash}</span>
                          </a>
                        </td>
                        <td>{formatEther(event.args[1])} ETH</td>
                        <td>{dayjs.unix((event?.blockData?.timestamp).toString()).fromNow()}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {errorReadingEvents && <div className="mt-2 text-red-500">{errorReadingEvents.message}</div>}
    </div>
  );
};

export default Home;

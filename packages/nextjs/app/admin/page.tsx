"use client";

import type { NextPage } from "next";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  //   hardhat,
  scrollSepolia,
} from "viem/chains";
import { usePublicClient } from "wagmi";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { AddressType } from "~~/types/abitype/abi";

const Admin: NextPage = () => {
  const account = privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`);

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("Faucet");

  // const publicClient = usePublicClient({ chainId: hardhat.id });
  const publicClient = usePublicClient({ chainId: scrollSepolia.id });

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [faucetBalance, setFaucetBalance] = useState("0");

  useEffect(() => {
    if (publicClient && deployedContractData) {
      publicClient.getBalance({ address: deployedContractData.address }).then((balance: any) => {
        setFaucetBalance(formatEther(balance));
      });
    }
  }, [publicClient, deployedContractData]);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("Faucet");

  // Faucet Owner

  const { data: owner } = useScaffoldReadContract({
    contractName: "Faucet",
    functionName: "owner",
    watch: true,
  });

  // Faucet Status

  const { data: faucetActive } = useScaffoldReadContract({
    contractName: "Faucet",
    functionName: "faucetActive",
    watch: true,
  });

  // Change Faucet Status

  const changeFaucetStatus = async () => {
    try {
      await writeYourContractAsync({
        functionName: "toggleFaucetStatus",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const FaucetToggle: () => JSX.Element = () => {
    return (
      <div className={`flex space-x-2 h-8 items-center justify-center text-sm `}>
        <span className={`mr-2 transition ${!faucetActive ? "font-bold" : "font-thin"}`}>Off</span>
        <label htmlFor="toggle-faucet">
          <input
            id="toggle-faucet"
            type="checkbox"
            className="toggle toggle-primary bg-primary hover:bg-primary border-primary "
            onChange={changeFaucetStatus}
            checked={faucetActive}
          />
        </label>
        <span className={`ml-2 transition ${faucetActive ? "font-bold " : "font-thin"}`}>On</span>
      </div>
    );
  };

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

  const updateDailyLimit = async () => {
    if (dailyLimit && dailyLimitValue == formatEther(dailyLimit)) return;
    try {
      await writeYourContractAsync({
        functionName: "updateDailyLimit",
        args: [parseEther(dailyLimitValue)],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Frecuencia de solicitud

  const { data: withdrawFrequency } = useScaffoldReadContract({
    contractName: "Faucet",
    functionName: "withdrawFrequency",
    watch: true,
  });

  const [withdrawFrequencyValue, setWithdrawFrequencyValue] = useState(0);

  useEffect(() => {
    if (!withdrawFrequency) return;
    const value = Number(withdrawFrequency) / 3600;
    setWithdrawFrequencyValue(value);
  }, [withdrawFrequency]);

  const updateWithdrawFrequency = async () => {
    const value = BigInt(withdrawFrequencyValue * 3600);
    if (withdrawFrequency && value == withdrawFrequency) return;
    try {
      await writeYourContractAsync({
        functionName: "updateWithdrawFrequency",
        args: [value],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Importe máx. por cuenta

  const { data: totalLimit } = useScaffoldReadContract({
    contractName: "Faucet",
    functionName: "totalLimit",
    watch: true,
  });

  const [totalLimitValue, setTotalLimitValue] = useState("0");

  useEffect(() => {
    if (!totalLimit) return;
    const value = formatEther(totalLimit);
    setTotalLimitValue(value);
  }, [totalLimit]);

  const updateTotalLimit = async () => {
    if (totalLimit && totalLimitValue == formatEther(totalLimit)) return;
    try {
      await writeYourContractAsync({
        functionName: "updateTotalLimit",
        args: [parseEther(totalLimitValue)],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Whitelist

  const [whitelistedAddresses, setWhitelistedAddresses]: any = useState([]);

  const {
    data: whitelistEvents,
    isLoading: isLoadingEvents,
    // error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "Faucet",
    eventName: "WhitelistUpdated",
    fromBlock: 6951976n, // scrollSepolia
    // fromBlock: 0n, // hardhat
    watch: true,
  });

  const eventsToShow = useMemo(() => {
    if (!whitelistEvents || isLoadingEvents) return [];
    const reversed = whitelistEvents.reverse();
    const filteredWhitelistEvents = reversed.filter((event, index): any => {
      const lastOccurrenceIndex = reversed.findIndex(
        (lastEvent, lastIndex) => lastIndex > index && lastEvent.args[0] === event.args[0],
      );
      return lastOccurrenceIndex === -1;
    });
    return filteredWhitelistEvents.filter(event => event.args[1] === true);
  }, [whitelistEvents, isLoadingEvents]);

  useEffect(() => {
    setWhitelistedAddresses(eventsToShow);
  }, [eventsToShow]);

  // Remove from Whitelist

  const removeFromWhitelist = async (addressToRemove: string) => {
    try {
      await writeYourContractAsync({
        functionName: "removeFromWhitelist",
        args: [addressToRemove],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Add Address to Whitelist

  const [addressToWhitelist, setAddressToWhitelist] = useState("");

  const addToWhitelist = async () => {
    try {
      await writeYourContractAsync({
        functionName: "addToWhitelist",
        args: [addressToWhitelist],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Transfer Ownership

  const [addressToTransferOwnership, setAddressToTransferOwnership] = useState("");

  const transferOwnership = async () => {
    try {
      await writeYourContractAsync({
        functionName: "transferOwnership",
        args: [addressToTransferOwnership],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Retirar todo el Balance

  const withdrawAll = async () => {
    try {
      await writeYourContractAsync({
        functionName: "withdrawAll",
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!deployedContractData || deployedContractLoading) {
    return;
  }

  return (
    <div
      className={`flex flex-col items-center self-center w-full px-4 mt-2 ${
        mounted && resolvedTheme === "dark" ? "text-white" : "text-indigo-400"
      } md:w-4/5 lg:w-2/3 leading-8`}
    >
      <div className="mb-2 text-3xl font-bold text-center">Faucet ETH Kipu - Scroll Sepolia</div>
      <div className="mb-4 text-xl font-bold">Página de administración</div>
      {/* Admin Panel */}
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-between col-span-2">
          <div>Contrato</div>
          <Address
            disableAddressLink
            format={window.innerWidth < 768 ? "short" : "long"}
            address={deployedContractData.address}
            onlyEnsOrAddress
          />
        </div>

        <div className="flex flex-row items-center justify-between col-span-2">
          <div>Balance del faucet</div>
          {/* <Balance address={deployedContractData.address} className={`p-0 m-0 text-base !font-bold`} /> */}
          <div className="flex flex-row gap-2 font-bold">
            <div>{faucetBalance}</div>
            <div>ETH</div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between col-span-2">
          <div>Owner</div>
          <Address
            disableAddressLink
            format={window.innerWidth < 768 ? "short" : "long"}
            address={owner}
            onlyEnsOrAddress
          />
        </div>

        <div className="flex flex-row items-center justify-between col-span-2">
          <div>Cuenta intermediaria</div>
          <Address
            disableAddressLink
            format={window.innerWidth < 768 ? "short" : "long"}
            address={account.address}
            onlyEnsOrAddress
          />
        </div>

        <div className="flex flex-row items-center justify-between col-span-2">
          <div>Estado</div>
          <div>
            <FaucetToggle />
          </div>
        </div>

        <hr className="my-4 border-indigo-400" />

        <div className="flex flex-row justify-between col-span-2">
          <div className="w-2/5 md:w-1/2">Importe por solicitud</div>
          <div className="flex flex-row justify-between w-3/5 col-span-2">
            <div className="flex flex-row justify-between">
              <input
                className="w-[50px] text-center border border-indigo-400 mr-2"
                type="number"
                value={dailyLimitValue.toString()}
                onChange={e => setDailyLimitValue(e.target.value)}
                step={0.1}
                min={0}
                name="dailyLimitValue"
                id="dailyLimitValue"
              />
              <div>ETH</div>
            </div>
            <button
              className="text-white bg-indigo-400 btn btn-sm btn-primary hover:bg-indigo-600"
              onClick={updateDailyLimit}
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-between col-span-2">
          <div className="w-2/5 md:w-1/2">Frecuencia de solicitud</div>
          <div className="flex flex-row justify-between w-3/5 col-span-2">
            <div className="flex flex-row justify-between">
              <input
                className="w-[50px] text-center border border-indigo-400 mr-2"
                type="number"
                value={withdrawFrequencyValue}
                onChange={e => setWithdrawFrequencyValue(Number(e.target.value))}
                step={1}
                min={1}
                name="withdrawFrequencyValue"
                id="withdrawFrequencyValue"
              />
              <div>horas</div>
            </div>
            <button
              className="text-white bg-indigo-400 btn btn-sm btn-primary hover:bg-indigo-600"
              onClick={updateWithdrawFrequency}
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-between col-span-2">
          <div className="w-2/5 md:w-1/2">Importe máx. por cuenta</div>
          <div className="flex flex-row justify-between w-3/5 col-span-2">
            <div className="flex flex-row justify-between">
              <input
                className="w-[50px] text-center border border-indigo-400 mr-2"
                type="number"
                value={totalLimitValue.toString()}
                onChange={e => setTotalLimitValue(e.target.value)}
                step={0.1}
                min={0}
                name="totalLimitValue"
                id="totalLimitValue"
              />
              <div>ETH</div>
            </div>
            <button
              className="text-white bg-indigo-400 btn btn-sm btn-primary hover:bg-indigo-600"
              onClick={updateTotalLimit}
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="mt-4 mb-2 text-white bg-indigo-400">Whitelist</div>
        {/* <MapWhitelisted /> */}
        {whitelistedAddresses.length > 0 &&
          whitelistedAddresses.map((user: any, index: number) => {
            return (
              <div className="flex flex-row justify-between col-span-2 mb-1" key={index}>
                <Address
                  disableAddressLink
                  format={window.innerWidth < 768 ? "short" : "long"}
                  address={user.args[0]}
                  onlyEnsOrAddress
                />
                <button
                  className="text-white bg-indigo-400 btn btn-sm btn-primary hover:bg-indigo-600"
                  onClick={removeFromWhitelist.bind(this, user.args[0])}
                >
                  Retirar
                </button>
              </div>
            );
          })}

        <div className="flex flex-row justify-between">
          <div className="flex-grow pr-24">
            <AddressInput
              placeholder="Coloque el address"
              value={addressToWhitelist}
              onChange={value => setAddressToWhitelist(value as AddressType)}
              name="addressToWhitelist"
            />
          </div>
          <button
            className="text-white bg-indigo-400 btn btn-sm btn-primary hover:bg-indigo-600"
            onClick={addToWhitelist}
          >
            Añadir
          </button>
        </div>

        <hr className="my-4 border-indigo-400" />

        <div className="flex flex-row justify-between">
          <div className="flex-grow pr-12">
            <AddressInput
              placeholder="Coloque el address"
              value={addressToTransferOwnership}
              onChange={value => setAddressToTransferOwnership(value as AddressType)}
              name="addressToTransferOwnership"
            />
          </div>
          <button className="text-white btn btn-sm btn-error" onClick={transferOwnership}>
            Nuevo Owner
          </button>
        </div>

        <div className="flex flex-row justify-between col-span-2">
          <div>Retirar todo el balance</div>
          <button className="text-white btn btn-sm btn-error" onClick={withdrawAll}>
            Ejecutar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

import { BackButton } from "./BackButton";
import { ContractTabs } from "./ContractTabs";
import { Address, Balance } from "~~/components/scaffold-eth";

export const AddressComponent = ({
  address,
  contractData,
}: {
  address: string;
  contractData: { bytecode: string; assembly: string } | null;
}) => {
  return (
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <BackButton />
      </div>
      <div className="grid grid-cols-1 col-span-5 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col col-span-1">
          <div className="px-6 py-4 mb-6 space-y-1 overflow-x-auto border shadow-md bg-base-100 border-base-300 shadow-secondary rounded-3xl lg:px-8">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <Address address={address} format="long" onlyEnsOrAddress />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">Balance:</span>
                  <Balance address={address} className="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContractTabs address={address} contractData={contractData} />
    </div>
  );
};

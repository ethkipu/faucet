import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { Address } from "~~/components/scaffold-eth";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({ address, modalId }: AddressQRCodeModalProps) => {
  return (
    <>
      <div>
        <input type="checkbox" id={`${modalId}`} className="modal-toggle" />
        <label htmlFor={`${modalId}`} className="cursor-pointer modal">
          <label className="relative modal-box">
            {/* dummy input to capture event onclick on modal box */}
            <input name="dummyInput2" id="dummyInput2" className="absolute top-0 left-0 w-0 h-0" />
            <label htmlFor={`${modalId}`} className="absolute btn btn-ghost btn-sm btn-circle right-3 top-3">
              ✕
            </label>
            <div className="py-6 space-y-3">
              <div className="flex flex-col items-center gap-6">
                <QRCodeSVG value={address} size={256} />
                <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};

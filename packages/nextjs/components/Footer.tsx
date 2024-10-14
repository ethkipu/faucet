/**
 * Site footer
 */
export const Footer = () => {
  // const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  // const { targetNetwork } = useTargetNetwork();

  return (
    <div className="min-h-0 px-1 py-5 mb-11 lg:mb-0">
      <div>
        {/* changed justify-between for justify-end*/}
        <div className="fixed bottom-0 left-0 z-10 flex items-center justify-end w-full p-4 pointer-events-none">
          {/* <div className="flex flex-col gap-2 pointer-events-auto md:flex-row">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="gap-1 font-normal cursor-auto btn btn-primary btn-sm">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="gap-1 font-normal btn btn-primary btn-sm">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div> */}
          {/* <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} /> */}
        </div>
      </div>
      <div className="w-full">
        <ul className="w-full menu menu-horizontal">
          <div className="flex items-center justify-center w-full gap-2 text-sm">
            <div className="text-center">
              <a href="https://t.me/ETHKipu" target="_blank" rel="noreferrer" className="link">
                ETHKipu
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};

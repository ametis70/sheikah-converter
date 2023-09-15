import { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";

import infoButton from "../assets/info-button.svg";
import modalCorner from "../assets/modal-corner.svg";

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeButtonRef = useRef(null);

  return (
    <>
      <header className="grid grid-cols-3 py-10 w-fit mx-auto justify-center">
        <div />
        <h1 className="text-blue text-apptitle sheikah-glow-text">
          Sheikah Converter
        </h1>
        <button
          onClick={() => { setModalOpen(true); }}
          className="flex items-center justify-center gap-3 text-blue sheikah-glow-text text-base font-medium italic ml-auto focus-default"
        >
          <img alt="" src={infoButton} className="flex-0 drop-shadow-glow" />{" "}
          info
        </button>
      </header>
      <Transition show={modalOpen} as={Fragment}>
        <Dialog
          onClose={() => { setModalOpen(false); }}
          initialFocus={closeButtonRef}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed top-0 left-0 w-full h-full bg-dim flex items-center justify-center backdrop-blur-md" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
              <Dialog.Panel className="text-tan h-fit flex flex-col items-center">
                <div className="relative bg-overlaydark pt-12 pb-8 px-36 flex flex-col items-center">
                  <img
                    alt=""
                    src={modalCorner}
                    className="absolute top-4 left-4"
                  />
                  <img
                    alt=""
                    src={modalCorner}
                    className="absolute top-4 right-4 rotate-90"
                  />
                  <img
                    alt=""
                    src={modalCorner}
                    className="absolute bottom-4 right-4 rotate-180"
                  />
                  <img
                    alt=""
                    src={modalCorner}
                    className="absolute bottom-4 left-4 -rotate-90"
                  />
                  <Dialog.Title className="text-modaltitle italic font-bold leading-10">
                    Sheikah Converter
                  </Dialog.Title>
                  <Dialog.Description className="text-modalsubtitle italic">
                    TLoZ: BotW saves converter
                  </Dialog.Description>
                  <p className="text-base italic w-[42ch] leading-7 pt-8">
                    In this website you can convert your save files from The
                    Legend of Zelda: Breath of the Wild from one console format
                    to another (Switch to Wii U or Wii U to Switch). Just upload
                    the save folder and convert away!
                    <br />
                    <br />
                    You can check the source code on{" "}
                    <a
                      className="text-green focus-default"
                      href="https://github.com/ametis70/sheikah-converter"
                    >
                      GitHub
                    </a>
                    .
                  </p>
                </div>
                <button
                  className="text-button font-medium italic bg-scrim rounded p-[3px] w-[330px] mt-12 focus-default"
                  onClick={() => { setModalOpen(false); }}
                  ref={closeButtonRef}
                >
                  <div className="py-3 w-full flex items-center justify-center border-buttonborder border rounded-sm">
                    Close
                  </div>
                </button>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default Header;

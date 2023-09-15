import { ReactNode, useState } from "react";
import { Tab } from "@headlessui/react";

import ActionButton from "./ActionButton";

import open from "../assets/actions/open.svg";
import convert from "../assets/actions/convert.svg";
import save from "../assets/actions/save.svg";
import separator from "../assets/separator.svg";

type ActionData = {
  title: string;
  subtitle: string;
  icon: string;
  description: ReactNode;
};

const Actions = () => {
  const [sourceType] = useState("Wii U");
  const [targetType] = useState("Switch");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const actions: ActionData[] = [
    {
      title: "Select Folder",
      subtitle: "Select a save folder from disk",
      icon: open,
      description: (
        <p className="description">
          Select a folder that contains a save. <br />
          The converter will automatically determine if it’s a save for{" "}
          <span>Wii U</span> or <span>Switch</span> in the next step.
        </p>
      ),
    },
    {
      title: "Convert",
      subtitle: "Convert the selected save",
      icon: convert,
      description: (
        <p className="description">
          The selected save is a <span>{sourceType}</span> save. It will be
          converted to the <span>{targetType}</span> format. <br />
          The original file in your disk won’t be modified.
        </p>
      ),
    },
    {
      title: "Save",
      subtitle: "Download the converted save",
      icon: save,
      description: (
        <p className="description">
          Your save is ready to be used on the <span>{targetType}</span>{" "}
          console. <br />
          Copy it to your emulator save folder or use homebrew to restore it as
          a backup on the actual console.
        </p>
      ),
    },
  ];

  return (
    <>
      <div className="flex-1" />
      <main className="flex flex-col items-center mx-auto flex-0 mb-16">
        <h2 className="text-actiontitle text-blue sheikah-glow-text italic font-medium text-center leading-none pb-16">
          {actions[selectedTabIndex].title}
        </h2>
        <Tab.Group
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <Tab.List className="flex gap-4 pb-12">
            {actions.map(({ icon }, index) => (
              <Tab key={`${icon}-${index}`}>
                <ActionButton
                  icon={icon}
                  disabled={index === 2}
                  active={index === selectedTabIndex}
                  onMouseEnter={() => { setSelectedTabIndex(index); }}
                  onFocus={() => { setSelectedTabIndex(index); }}
                  onClick={() => undefined}
                  onKeyUp={() => undefined}
                />
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {actions.map(({ icon, description, subtitle }, id) => (
              <Tab.Panel key={`${icon}-${id}`} tabIndex={-1}>
                <p className="text-actionsubtitle text-blue sheikah-glow-text italic font-medium text-center ">
                  <strong>{subtitle}</strong>
                </p>
                <img alt="" src={separator} />
                <div className="text-base text-blue font-medium italic w-[44ch] leading-8 mx-auto">
                  {description}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </main>
      <div className="flex-1" />
    </>
  );
};

export default Actions;

import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
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
  onClick?: () => void;
  disabled: boolean;
};

const Actions = () => {
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [sourceType] = useState("Wii U");
  const [targetType] = useState("Switch");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [originalSave, setOriginalSave] = useState<Record<
    string,
    ArrayBuffer
  > | null>(null);

  const actions: ActionData[] = [
    {
      title: "Select Zip",
      subtitle: "Select a save zip from disk",
      icon: open,
      description: (
        <p className="description">
          Select a zip that contains a save. <br />
          The converter will automatically determine if it’s a save for{" "}
          <span>Wii U</span> or <span>Switch</span> in the next step.
        </p>
      ),
      onClick: () => {
        filePickerRef.current?.click();
      },
      disabled: false,
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
      disabled: !originalSave,
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
      disabled: true,
    },
  ];

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error("no file");
      return;
    }

    const handleZip = async () => {
      const zip = await JSZip.loadAsync(file);
      const zipPromises: Promise<Record<string, ArrayBuffer>>[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;
        zipPromises.push(
          new Promise((resolve) => {
            zipEntry
              .async("arraybuffer")
              .then((data) => {
                resolve({ [relativePath]: data });
              })
              .catch(() => {
                console.error(`Error when getting data for ${relativePath}`);
              });
          })
        );
      });

      const files = await Promise.all(zipPromises);
      setOriginalSave(
        files.reduce((acc, file) => {
          return { ...acc, ...file };
        }, {})
      );
    };

    void handleZip();
  };

  useEffect(() => {
    console.log(originalSave);
  }, [originalSave]);

  return (
    <>
      <input hidden type="file" ref={filePickerRef} onChange={onChange} />
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
            {actions.map(({ icon, onClick, disabled }, index) => (
              <Tab key={`${icon}-${index}`}>
                <ActionButton
                  icon={icon}
                  active={index === selectedTabIndex}
                  disabled={disabled}
                  onMouseEnter={() => {
                    setSelectedTabIndex(index);
                  }}
                  onFocus={() => {
                    setSelectedTabIndex(index);
                  }}
                  onClick={onClick ?? (() => undefined)}
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

import disabledBG from "../assets/box/disabled.svg";
import inactiveBG from "../assets/box/inactive.svg";
import activeBG from "../assets/box/active.svg";

type ActionButtonProps = {
  icon: string;
  disabled: boolean;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onFocus: () => void;
  onKeyUp: () => void;
};

const ActionButton = ({
  icon,
  disabled,
  active,
  onClick,
  onMouseEnter,
  onFocus,
  onKeyUp,
}: ActionButtonProps) => (
  <div
    className="relative w-[130px] h-[130px] left-0"
    onMouseEnter={onMouseEnter}
    onFocus={onFocus}
    onClick={onClick}
    onKeyUp={onKeyUp}
  >
    <img
      alt=""
      className={`absolute top-0 left-0 ${active ? "sheikah-glow" : ""}`}
      src={disabled ? disabledBG : active ? activeBG : inactiveBG}
    />
    {disabled ? null : (
      <img
        alt=""
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        src={icon}
      />
    )}
  </div>
);

export default ActionButton;

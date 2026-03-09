import React from "react";

interface FilterChipsProp {
  severity: string;
}

const getChipsStyle = (severity: string) => {
  switch (severity) {
    case "Critical":
      return { bgColor: "bg-priority/20", textColor: "text-priority" };
  }
};

function FilterChips({ severity }: FilterChipsProp) {
  const style = getChipsStyle(severity);
  return (
    <div
      className={`rounded-full ${style?.bgColor} ${style?.textColor} py-1.5 px-3 font-bold text-xs`}
    >
      {severity}
    </div>
  );
}

export default FilterChips;

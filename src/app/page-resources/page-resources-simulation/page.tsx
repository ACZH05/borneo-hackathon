"use client";

import { useState } from "react";
import SimulationHeader from "./components/Simulation-Header";
import SimulationOption from "./components/Simulation-Option";
import SimulationQuestion from "./components/Simulation-Question";

export default function ResourcesSimulationPage() {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedHazard, setSelectedHazard] = useState<string>("");

  if (!isSimulating) {
    return (
      <div>
        <SimulationHeader />
        <SimulationOption setIsSimulating={setIsSimulating} setSelectedHazard={setSelectedHazard} />
      </div>
    );
  }

  return (
    <div>
      <SimulationQuestion hazardType={selectedHazard} setIsSimulating={setIsSimulating} />
    </div>
  );
}
"use client";

import { FormEvent, useMemo, useState } from "react";
import { EmergencyPlan } from "./types";

type ChecklistListAddProps = {
	userId: string | null;
	onPlanGenerated: (newPlan: EmergencyPlan) => void;
};

const PRESET_HAZARDS = ["Flood", "Landslide", "Wildfire"];

export default function ChecklistListAdd({ userId, onPlanGenerated }: ChecklistListAddProps) {
	const [selectedHazard, setSelectedHazard] = useState(PRESET_HAZARDS[0]);
	const [customHazard, setCustomHazard] = useState("");
	const [householdSize, setHouseholdSize] = useState("1");
	const [pets, setPets] = useState("0");
	const [specialNeeds, setSpecialNeeds] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const hazardType = useMemo(() => {
		if (selectedHazard === "Other")
			return customHazard.trim();
		return selectedHazard;
	}, [customHazard, selectedHazard]);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (!userId) {
			setError("Unable to identify your account. Please re-login and try again.");
			return;
		}

		if (!hazardType) {
			setError("Please choose or enter a hazard type.");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch("/api/ai/generate-plan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					hazardType,
					familySize: Number(householdSize) || 1,
					pets: Number(pets) || 0,
					specialNeeds,
				}),
			});

			const data = await response.json();
			if (!response.ok || !data.plan) {
				throw new Error(data.error || "Failed to generate checklist.");
			}

			onPlanGenerated(data.plan as EmergencyPlan);
		} catch (requestError) {
			const message = requestError instanceof Error ? requestError.message : "Failed to generate checklist.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 h-full">
			{/* --- Title & Description --- */}
			<div className="flex flex-col items-center justify-center gap-3">
				<h1 className="text-3xl font-bold">Create Checklist</h1>
				<p className="text-textGrey">Fill in your household details so AI can generate a focused checklist.</p>
			</div>

			{/* --- Input Field --- */}
			<form onSubmit={onSubmit} className="space-y-3 flex flex-col items-stretch justify-center">
				<div>
					<label className="block text-sm font-semibold mb-2">Hazard Type</label>
					<div className="relative">
						{/* --- Selection --- */}
						<select
							value={selectedHazard}
							onChange={(event) => setSelectedHazard(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:border-primary focus:border-2 focus:outline-none appearance-none"
						>
							{PRESET_HAZARDS.map((hazard) => (
								<option key={hazard} value={hazard}>
									{hazard}
								</option>
							))}
							<option value="Other">Other (Custom Input)</option>
						</select>
							
						{/* --- The Custom Arrow --- */}
						<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
							<span className="material-symbols-outlined text-gray-500">expand_more</span>
						</div>
					</div>

					{/* --- Optional Input Field --- */}
					{selectedHazard === "Other" && (
						<input
							value={customHazard}
							onChange={(event) => setCustomHazard(event.target.value)}
							placeholder="Enter Custom Hazard Type"
							className="w-full mt-3 rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:border-2 focus:outline-none"
						/>
					)}
				</div>

				{/* --- Household Size --- */}
				<div>
					<label className="block text-sm font-semibold mb-2">Household Size</label>
					<input
						type="number"
						min={1}
						value={householdSize}
						onChange={(event) => setHouseholdSize(event.target.value)}
						className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:border-2 focus:outline-none"
						required
					/>
				</div>

				{/* --- Number of Pets --- */}
				<div>
					<label className="block text-sm font-semibold mb-2">Number of Pets</label>
					<input
						type="number"
						min={0}
						value={pets}
						onChange={(event) => setPets(event.target.value)}
						className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:border-2 focus:outline-none"
						required
					/>
				</div>

				{/* --- Special Needs / Medical Notes --- */}
				<div>
					<label className="block text-sm font-semibold mb-2">Special Needs / Medical Notes</label>
					<textarea
						value={specialNeeds}
						onChange={(event) => setSpecialNeeds(event.target.value)}
						placeholder="E.g. Insulin Storage, Wheelchair Access, Elderly Care Needs, etc."
						rows={4}
						className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:border-2 focus:outline-none"
					/>
				</div>

				{error && <p className="text-red-600 text-sm">{error}</p>}

				{/* --- Submit Button --- */}
				<div className="flex justify-center">
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-lg bg-primary text-white px-5 py-3 font-semibold disabled:opacity-60"
					>
						{isSubmitting ? "Generating..." : "Generate Checklist"}
					</button>
				</div>
			</form>
		</div>
	);
}

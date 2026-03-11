"use client";

import { useEffect, useMemo, useState } from "react";
import { ChecklistItem, EmergencyPlan } from "./types";

type ChecklistListViewProps = {
	plan: EmergencyPlan | null;
	isPersisting: boolean;
	hasPendingChanges: boolean;
	onChecklistChange: (checklist: ChecklistItem[]) => void;
	onSave: () => Promise<void>;
};

export default function ChecklistListView({
	plan,
	isPersisting,
	hasPendingChanges,
	onChecklistChange,
	onSave,
}: ChecklistListViewProps) {
	const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>([]);

	useEffect(() => {
		if (!plan) {
			setLocalChecklist([]);
			return;
		}
		setLocalChecklist(plan.checklist);
	}, [plan]);

	const completionCount = useMemo(
		() => localChecklist.filter((item) => item.isCompleted).length,
		[localChecklist]
	);

	{/* --- Toggle Logic --- */}
	const toggleItem = (index: number) => {
		const nextChecklist = localChecklist.map((item, itemIndex) =>
			itemIndex === index ? { ...item, isCompleted: !item.isCompleted } : item
		);
		setLocalChecklist(nextChecklist);
		onChecklistChange(nextChecklist);
	};

	{/* --- Avoid Null Plan --- */}
	if (!plan) {
		return (
			<div className="h-full flex items-center justify-center text-foreground">
				Select a checklist from history or create a new one.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{/* --- Plan Title --- */}
			<h1 className="text-3xl font-bold">{plan.title}</h1>

			{/* --- Hazard Type --- */}
			<p className="text-sm text-foreground">Hazard: {plan.hazardType}</p>

			{/* --- Completion Status --- */}
			<div className="rounded-lg bg-secondary/20 px-4 py-3 text-sm">
				{completionCount}/{localChecklist.length} Item(s) Completed
			</div>

			{/* --- Checklist Items --- */}
			<div className="flex flex-col gap-3">
				{localChecklist.map((item, index) => (
					<button
						key={`${item.task}-${index}`}
						onClick={() => toggleItem(index)}
						className="w-full flex items-center gap-3 rounded-lg border border-foreground/20 bg-white px-4 py-3 text-left hover:border-primary/40"
					>
						{/* --- Check Button --- */}
						<span
							className={`flex shrink-0 items-center justify-center h-5 w-5 rounded border ${
								item.isCompleted ? "bg-primary border-primary text-white" : "border-foreground"
							}`}
						>
							{item.isCompleted ? "✓" : ""}
						</span>

						{/* --- Content --- */}
						<span className={`text-justify ${item.isCompleted ? "line-through text-foreground" : "text-textGrey"}`}>{item.task}</span>
					</button>
				))}
			</div>

			{/* --- Unsaved Changes Notification --- */}
			<div
				className={`text-sm font-medium ${
					hasPendingChanges ? "text-red-600" : "text-green-600"
				}`}
			>
				{hasPendingChanges ? "Not Sync Yet" : "Already Sync"}

			</div>

			{/* --- Save Button --- */}
			<button
				onClick={onSave}
				disabled={isPersisting}
				className="rounded-lg bg-primary text-white px-5 py-3 font-semibold disabled:opacity-60"
			>
				{isPersisting ? "Saving..." : "Save Checklist"}
			</button>
		</div>
	);
}

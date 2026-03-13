"use client";

type ChecklistListInitialProps = {
	onOpenAdd: () => void;
};

export default function ChecklistListInitial({ onOpenAdd }: ChecklistListInitialProps) {
	return (
		<div className="flex flex-col items-center justify-start gap-10 min-h-full">
			{/* --- Title --- */}
			<h1 className="flex flex-col items-center justify-center text-6xl font-bold gap">
				<span className="text-center">Smart Emergency</span>
				<span className=" text-primary">Checklists</span>
			</h1>

			{/* --- Description --- */}
			<p className="text-xl text-textGrey text-center">
				Generate and manage personalized preparedness lists for your home and family based on your specific location and needs.
			</p>

			 {/* --- Steps --- */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-xl border border-gray-200 p-4 bg-white">
					<h2 className="font-semibold">1. Describe Context</h2>
					<p className="text-sm text-textGrey text-justify">Choose your hazard type and share your household details.</p>
				</div>
				<div className="rounded-xl border border-gray-200 p-4 bg-white">
					<h2 className="font-semibold">2. Generate Plan</h2>
					<p className="text-sm text-textGrey text-justify">AI builds an actionable checklist tailored to your situation.</p>
				</div>
				<div className="rounded-xl border border-gray-200 p-4 bg-white">
					<h2 className="font-semibold">3. Track Progress</h2>
					<p className="text-sm text-textGrey text-justify">Tick items and save progress to your checklist history.</p>
				</div>
			</div>

			 {/* --- Create Button --- */}
			<button
				onClick={onOpenAdd}
				className="rounded-lg bg-primary text-white px-5 py-3 font-semibold hover:opacity-90 transition-opacity"
			>
				Create New Checklist
			</button>
		</div>
	);
}

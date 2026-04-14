"use client";

import { useEffect, useState } from "react";
import { BodyView, EmergencyPlan } from "./types";

type ChecklistDrawerProps = {
    activeView: BodyView;
    history: EmergencyPlan[];
    isHistoryLoading: boolean;
    selectedPlanId: string | null;
    onOpenInitial: () => void;
    onOpenAdd: () => void;
    onOpenPlan: (plan: EmergencyPlan) => void;
};

export default function ChecklistDrawer({
    activeView,
    history,
    isHistoryLoading,
    selectedPlanId,
    onOpenInitial,
    onOpenAdd,
    onOpenPlan,
}: ChecklistDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [fabBottom, setFabBottom] = useState(16);

    {/* --- Dynamically Calculate FAB Position to Avoid Footer Overlap --- */}
    {/* --- Keep FAB Fixed While Lifting it above footer when needed --- */}
    useEffect(() => {
        const updateFabBottom = () => {
            const footer = document.getElementById("site-footer");
            if (!footer) {
                setFabBottom(16);
                return;
            }

            const footerRect = footer.getBoundingClientRect();
            const overlap = Math.max(0, window.innerHeight - footerRect.top);

            // 16px default gap from viewport bottom, plus any overlap with footer.
            setFabBottom(16 + overlap);
        };

        updateFabBottom();
        window.addEventListener("scroll", updateFabBottom, { passive: true });
        window.addEventListener("resize", updateFabBottom);

        return () => {
            window.removeEventListener("scroll", updateFabBottom);
            window.removeEventListener("resize", updateFabBottom);
        };
    }, []);

    const onSelectInitial = () => {
        onOpenInitial();
        setIsOpen(false);
    };

    const onSelectAdd = () => {
        onOpenAdd();
        setIsOpen(false);
    };
    const onSelectPlan = (plan: EmergencyPlan) => {
        onOpenPlan(plan);
        setIsOpen(false);
    };

    {/* --- Helper to Count Completed Items --- */}
    const getCompletedItems = (plan: EmergencyPlan) => {
        let complete = 0;

        for (const item of plan.checklist)
            if (item.isCompleted)
                complete++;

        return <span className={`text-xs font-bold ${complete === plan.checklist.length ? "text-green-500" : "text-red-500"}`}>Completed: {complete}/{plan.checklist.length}</span>;
    };

    return (
        <>
            {/* --- Mobile Toggle Button --- */}
            {/* This button is fixed at the bottom-right corner on mobile, and hidden on desktop. It opens the drawer when clicked. */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`
                    xl:hidden fixed right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-2xl hover:scale-105 active:scale-95 transition-all
                `}
                style={{ bottom: `${fabBottom}px` }} // Dynamically adjust bottom position to avoid footer overlap.
            >
                <span className="material-symbols-outlined">checklist</span>
            </button>

            {/* --- Mobile Dark Overlay --- */}
            {/* Only renders when the drawer is open on small screens. Clicking it closes the drawer. */}
            {isOpen && (
                <div 
                    className="xl:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* --- Drawer --- */}
            <div 
                className={`
                    fixed top-0 left-0 z-50 h-full max-w-[85vw] min-h-full bg-white p-10 transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    xl:static xl:flex-1 xl:z-0 xl:max-w-[35vw] xl:border-r xl:border-foreground/20 xl:translate-x-0 
                    overflow-y-auto
                `}
            >
                {/* --- Drawer Content --- */}
                <div className="flex flex-col gap-6">
                    {/* --- Mobile Close Button (Hidden on Desktop) --- */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="xl:hidden flex justify-end text-foreground hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    {/* --- View Selection Buttons --- */}
                    <div className="flex flex-col gap-2">
                        {/* --- Introduction --- */}
                        <button
                            onClick={onSelectInitial}
                            className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                activeView === "initial" ? "bg-primary/10 text-primary" : "hover:bg-foreground/5"
                            }`}
                        >
                            <span className="material-symbols-outlined mr-2">info</span>
                            Introduction
                        </button>

                        {/* --- Create New Checklist --- */}
                        <button
                            onClick={onSelectAdd}
                            className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                activeView === "add" ? "bg-primary/10 text-primary" : "hover:bg-foreground/5"
                            }`}
                        >
                            <span className="material-symbols-outlined mr-2">add</span>
                            Create New Checklist
                        </button>
                    </div>

                    <hr className="border-foreground/20" />

                    {/* --- Checklist History --- */}
                    <div className="flex flex-col gap-2 overflow-hidden">
                        <h2 className="text-sm uppercase tracking-wide text-textGrey py-2">Checklist History</h2>
                        {isHistoryLoading ? (
                            <p className="text-textGrey">Loading History...</p>
                        ) : history.length === 0 ? (
                            <p className="text-textGrey">No checklist history yet.</p>
                        ) : (
                            <div className="h-full overflow-y-auto pr-1 space-y-2">
                                {history.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => onSelectPlan(plan)}
                                        className={`flex flex-col gap-2 w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                            selectedPlanId === plan.id
                                                ? "border-primary bg-primary/10"
                                                : "border-foreground/20 hover:border-primary/40 hover:bg-foreground/5"
                                        }`}
                                    >
                                        <div className="flex justify-between">
                                            {getCompletedItems(plan)}
                                            <p className="text-xs text-textGrey">{plan.hazardType}</p>
                                        </div>
                                        
                                        {/* --- Plan Title --- */}
                                        <p className="font-semibold text-sm text-justify line-clamp-2">{plan.title}</p>

                                        {/* --- Created / Updated Timestamps --- */}
                                        <div className="flex justify-between">
                                            <p className="text-xs text-textGrey">{new Date(plan.createdAt).toLocaleDateString()}</p>
                                            <p className="text-xs text-textGrey">{new Date(plan.updatedAt).toLocaleTimeString()}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
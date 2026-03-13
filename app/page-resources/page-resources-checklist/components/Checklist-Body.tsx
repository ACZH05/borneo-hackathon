"use client";

import ChecklistListAdd from "./Checklist-List-Add";
import ChecklistListInitial from "./Checklist-List-Initial";
import ChecklistListView from "./Checklist-List-View";
import { BodyView, ChecklistItem, EmergencyPlan } from "./types";

const ChecklistListInitialComponent = (ChecklistListInitial as unknown as { default?: typeof ChecklistListInitial }).default ?? ChecklistListInitial;
const ChecklistListAddComponent = (ChecklistListAdd as unknown as { default?: typeof ChecklistListAdd }).default ?? ChecklistListAdd;
const ChecklistListViewComponent = (ChecklistListView as unknown as { default?: typeof ChecklistListView }).default ?? ChecklistListView;

type ChecklistBodyProps = {
    activeView: BodyView;
    userId: string | null;
    selectedPlan: EmergencyPlan | null;
    isPersisting: boolean;
    isDeleting: boolean;
    hasPendingChanges: boolean;
    onOpenAdd: () => void;
    onPlanGenerated: (newPlan: EmergencyPlan) => void;
    onChecklistChange: (checklist: ChecklistItem[]) => void;
    onSave: () => Promise<void>;
    onDelete: () => Promise<void>;
};

export default function ChecklistBody({
    activeView,
    userId,
    selectedPlan,
    isPersisting,
    isDeleting,
    hasPendingChanges,
    onOpenAdd,
    onPlanGenerated,
    onChecklistChange,
    onSave,
    onDelete,
}: ChecklistBodyProps) {
    const renderBody = () => {
        if (activeView === "initial") {
            return <ChecklistListInitialComponent onOpenAdd={onOpenAdd} />;
        }

        if (activeView === "add") {
            return <ChecklistListAddComponent userId={userId} onPlanGenerated={onPlanGenerated} />;
        }

        return (
            <ChecklistListViewComponent
                plan={selectedPlan}
                isPersisting={isPersisting}
                isDeleting={isDeleting}
                hasPendingChanges={hasPendingChanges}
                onChecklistChange={onChecklistChange}
                onSave={onSave}
                onDelete={onDelete}
            />
        );
    };

    return (
        <div className="flex-1 h-full w-full p-10 md:p-10 overflow-y-auto">
            {renderBody()}
        </div>
    );
}

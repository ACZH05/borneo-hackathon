export type ChecklistItem = {
  task: string;
  isCompleted: boolean;
};

export type EmergencyPlan = {
  id: string;
  userId: string;
  title: string;
  hazardType: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
};

export type BodyView = "initial" | "add" | "view";

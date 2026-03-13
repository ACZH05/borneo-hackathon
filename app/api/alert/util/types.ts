export interface AlertItemInfo {
  id?: string;
  severity: "priority" | "warning" | "monitor";
  hazardType: string;
  title: string;
  body: string;
  date: string;
  time: string;
  regionCode: string;
  lat: number;
  lng: number;
}

export type AlertApiResponse = {
  success: boolean;
  alerts?: AlertItemInfo[];
};

export type AlertStats = {
  latestAlert: AlertItemInfo | null;
  alertLevel: string;
  activeIncidents: number;
  lastUpdate: string;
  topTwoAlerts: AlertItemInfo[];
};

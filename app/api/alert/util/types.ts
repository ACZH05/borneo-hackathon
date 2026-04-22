export const ALERT_SOURCES = ["third_party_api", "user_report"] as const;
export type AlertSource = (typeof ALERT_SOURCES)[number];

export const ALERT_STATUSES = ["draft", "published"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export function isAlertSource(value?: string | null): value is AlertSource {
  return typeof value === "string" && ALERT_SOURCES.includes(value as AlertSource);
}

export function isAlertStatus(value?: string | null): value is AlertStatus {
  return typeof value === "string" && ALERT_STATUSES.includes(value as AlertStatus);
}

export interface AlertItemInfo {
  id?: string;
  severity: string;
  hazardType: string;
  title: string;
  body: string;
  date: string;
  time: string;
  createdAt: string;
  regionCode: string;
  stateName?: string | null;
  lat: number;
  lng: number;
  source: AlertSource;
  status: AlertStatus;
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

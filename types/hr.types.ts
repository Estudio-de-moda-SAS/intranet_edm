export type AppColor =
  | "purple"
  | "teal"
  | "blue"
  | "green"
  | "amber"
  | "coral"
  | "pink"
  | "rose";

export type HRIconName =
  | "users"
  | "calendarDays"
  | "fileText"
  | "heartHandshake"
  | "award"
  | "barChart3"
  | "graduationCap"
  | "briefcase"
  | "clipboardList"
  | "userPlus"
  | "clock"
  | "shieldCheck";

export type HRAppItem = {
  id  ?: string;
  label: string;
  description?: string;
  href: string;
  icon: HRIconName;
  color: AppColor;
};
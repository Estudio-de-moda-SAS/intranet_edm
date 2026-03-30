// lib/mock/configuracion.ts
// En producción reemplaza estos con llamadas a tu API/DB

import type {
  NotificationSettings,
  AppearanceSettings,
  AccessibilitySettings,
  Integration,
} from '@/types/settings';

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailAlerts:   true,
  emailDigest:   false,
  pushBrowser:   true,
  pushMobile:    false,
  soundDesktop:  true,
  taskAssigned:  true,
  taskDue:       true,
  mentions:      true,
  announcements: true,
  systemAlerts:  false,
  weeklyReport:  true,
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme:            'light',
  accentHue:        258,
  density:          'default',
  sidebarCollapsed: false,
  animations:       true,
};

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  highContrast:    false,
  largeText:       false,
  reduceMotion:    false,
  focusIndicators: true,
  screenReader:    false,
  fontSize:        'md',
};

export const INTEGRATIONS: Integration[] = [
  { id: 'slack',   name: 'Slack',            desc: 'Envía alertas a canales de Slack corporativo.',  connected: true,  icon: '💬', color: 'bg-[#4A154B]/10 text-[#4A154B]' },
  { id: 'teams',   name: 'Microsoft Teams',  desc: 'Notificaciones y accesos directos desde Teams.', connected: false, icon: '🟦', color: 'bg-blue-50 text-blue-700'       },
  { id: 'gsuite',  name: 'Google Workspace', desc: 'Sincroniza calendarios y documentos.',           connected: true,  icon: '📁', color: 'bg-amber-50 text-amber-700'     },
  { id: 'jira',    name: 'Jira',             desc: 'Gestión de tareas y tickets desde la intranet.', connected: false, icon: '🔵', color: 'bg-blue-50 text-blue-800'       },
  { id: 'github',  name: 'GitHub',           desc: 'Pull requests y deploy logs en tu dashboard.',   connected: false, icon: '⬛', color: 'bg-slate-100 text-slate-800'    },
  { id: 'powerbi', name: 'Power BI',         desc: 'Embebe reportes directamente en la intranet.',   connected: true,  icon: '📊', color: 'bg-yellow-50 text-yellow-700'   },
];
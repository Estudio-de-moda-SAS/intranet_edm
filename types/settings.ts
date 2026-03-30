// types/configuracion.ts

export type ConfigTab = 'notifications' | 'appearance' | 'accessibility' | 'integrations';

export interface NotificationSettings {
  emailAlerts:   boolean;
  emailDigest:   boolean;
  pushBrowser:   boolean;
  pushMobile:    boolean;
  soundDesktop:  boolean;
  taskAssigned:  boolean;
  taskDue:       boolean;
  mentions:      boolean;
  announcements: boolean;
  systemAlerts:  boolean;
  weeklyReport:  boolean;
}

export interface AppearanceSettings {
  theme:            'light' | 'dark' | 'system';
  accentHue:        number;
  density:          'compact' | 'default' | 'spacious';
  sidebarCollapsed: boolean;
  animations:       boolean;
}

export interface AccessibilitySettings {
  highContrast:    boolean;
  largeText:       boolean;
  reduceMotion:    boolean;
  focusIndicators: boolean;
  screenReader:    boolean;
  fontSize:        'sm' | 'md' | 'lg' | 'xl';
}

export interface Integration {
  id:        string;
  name:      string;
  desc:      string;
  connected: boolean;
  icon:      string;
  color:     string;
}
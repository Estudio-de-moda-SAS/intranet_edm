// types/perfil.ts
import type { DepartmentMember } from '../types/DepartmentMember';

export interface ProfileData extends DepartmentMember {
  phone?:      string;   // ✅ opcional en lugar de string | undefined
  department:  string;
  location?:   string;   // ✅
  timezone:    string;
  language:    string;
  joined?:     string;   // ✅
  employeeId?: string;   // ✅
}

export interface SessionEntry {
  id:       string;
  device:   string;
  location: string;
  lastSeen: string;
  current:  boolean;
  icon:     'desktop' | 'mobile';
}
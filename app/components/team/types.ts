export interface TeamMember {
  id:         string;
  name:       string;
  role:       string;
  department: string;
  image:      string;
  email?:     string;
  linkedin?:  string;
  /** Pequeña frase o lema personal — opcional */
  bio?:       string;
}
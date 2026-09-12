export enum FindingType {
  UNSAFE_CONDITION = 'Unsafe Condition',
  UNSAFE_ACTION = 'Unsafe Action'
}

export enum ReportStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED'
}

export enum UserRole {
  BPO = 'BPO',
  OFFICER = 'OFFICER',
  WORKER = 'WORKER'
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: number;
}

export interface K3Report {
  id: string;
  title: string;
  findingType: FindingType;
  category: string;
  description: string;
  locationName: string;
  gpsLocation: GPSLocation | null;
  status: ReportStatus;
  reporterName: string;
  reporterRole: string;
  photoUrl?: string;
  date: string;
  createdAt: { seconds: number };
  actionTaken?: string;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
}

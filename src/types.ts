export type RegionCode = 'AR' | 'MU' | 'PZ' | 'PS' | 'KN' | 'VN' | 'SC' | 'SP' | 'LE' | 'VG';

export const ALL_REGIONS: RegionCode[] = ['AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG'];

export type ActionType = 'Регистрация' | 'Редактирование' | 'Удаление';

export type MeterType = 
  | 'Меркурий 234 G7'
  | 'Ротек РТМ-03'
  | 'Ротек РТМ-01'
  | 'Нева 314'
  | 'Нева 412'
  | 'Энергомера CE-303';

export const METER_TYPES: MeterType[] = [
  'Меркурий 234 G7',
  'Ротек РТМ-03',
  'Ротек РТМ-01',
  'Нева 314',
  'Нева 412',
  'Энергомера CE-303',
];

export type RegistrationStatus = '' | 'Ok' | 'Error';

export interface MeterRecord {
  id: string;
  regionCode: RegionCode;
  bsNumber: string;
  actionType: ActionType;
  meterType: MeterType;
  meterNumber: string;
  modemType: string;
  simCardNumber: string;
  note: string;
  registrationDate: string;
  address: string;
  comment: string;
  registeredBy: string;
  registrationStatus: RegistrationStatus;
  statusDate: string;
  statusAdmin: string;
}

export interface User {
  login: string;
  password: string;
  regions: RegionCode[];
  role: 'user' | 'admin' | 'root';
  canEdit: boolean;
  canDelete: boolean;
  canSetStatus: boolean;
}

export const USERS: User[] = [
  { login: 'AR-user', password: 'qwerty', regions: ['AR'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'MU-user', password: 'qwerty', regions: ['MU'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'PZ-user', password: 'qwerty', regions: ['PZ'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'PS-user', password: 'qwerty', regions: ['PS'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'KN-user', password: 'qwerty', regions: ['KN'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'VG-user', password: 'qwerty', regions: ['VG'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'VN-user', password: 'qwerty', regions: ['VN'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'SP-East', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'SP-Nord', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'SP-West', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'SP-South', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false },
  { login: 'SP-admin', password: '12345', regions: ALL_REGIONS, role: 'admin', canEdit: true, canDelete: true, canSetStatus: true },
  { login: 'SP-root', password: 'a413401L', regions: ALL_REGIONS, role: 'root', canEdit: true, canDelete: true, canSetStatus: true },
];

export type Page = 'registration' | 'database' | 'feedback' | 'help' | 'about';

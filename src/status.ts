
export interface Status {
  type: 'STATUS';
  code: 'OK' | 'ALREADY_EXISTS' | 'NOT_FOUND';
  message?: string;
}

export function isOk(s: Status): boolean {
  return s.code == 'OK';
}

export function ok(): Status {
  return {type: 'STATUS', code: 'OK'};
}

export function notFound(): Status {
  return { type: 'STATUS', code: 'NOT_FOUND' };
}

export function alreadyExists(): Status {
  return { type: 'STATUS', code: 'ALREADY_EXISTS' };
}

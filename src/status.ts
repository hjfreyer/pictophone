
export interface Status {
  type: 'STATUS';
  code: 'OK' | 'ALREADY_EXISTS' | 'NOT_FOUND' | 'INTERNAL' | 'PRECONDITION_FAILED';
  message?: string;
}

export function isOk(s: Status): boolean {
  return s.code == 'OK';
}

export function ok(): Status {
  return { type: 'STATUS', code: 'OK' };
}

export function notFound(): Status {
  return { type: 'STATUS', code: 'NOT_FOUND' };
}

export function alreadyExists(): Status {
  return { type: 'STATUS', code: 'ALREADY_EXISTS' };
}

export function preconditionFailed(): Status {
  return { type: 'STATUS', code: 'PRECONDITION_FAILED' };
}

export function internal(): Status {
  return { type: 'STATUS', code: 'INTERNAL' };
}

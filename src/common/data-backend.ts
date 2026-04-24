export function dataBackend() {
  return String(process.env.DATA_BACKEND || 'file')
    .trim()
    .toLowerCase();
}

export function preferDatabase() {
  const backend = dataBackend();
  return backend === 'postgres' || backend === 'supabase';
}

export function hasDatabaseUrl() {
  return !!String(process.env.DATABASE_URL || '').trim();
}

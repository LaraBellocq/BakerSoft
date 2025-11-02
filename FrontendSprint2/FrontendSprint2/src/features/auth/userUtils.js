function normalizeText(value = '') {
  let result = String(value ?? '');
  if (typeof result.normalize === 'function') {
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  return result.trim();
}

export function getUserName(user) {
  if (!user || typeof user !== 'object') {
    return '';
  }

  const candidates = [
    user.nombre_completo,
    user.full_name,
    user.name,
    user.display_name,
    user.username,
  ];

  for (const candidate of candidates) {
    if (candidate && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }

  const first = user.first_name ?? user.nombre;
  const last = user.last_name ?? user.apellido;

  if (first || last) {
    return [first, last].filter(Boolean).join(' ').trim();
  }

  if (user.email) {
    return String(user.email).trim();
  }

  return '';
}

export function getUserEmail(user) {
  if (!user || typeof user !== 'object') {
    return '';
  }
  return typeof user.email === 'string' ? user.email.trim() : '';
}

export function getUserInitials(user, fallback = 'US') {
  const name = getUserName(user);
  const base = name || getUserEmail(user);
  if (!base) {
    return fallback;
  }

  const clean = normalizeText(base);
  if (!clean) {
    return fallback;
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return fallback;
  }

  if (parts.length === 1) {
    const segment = parts[0].replace(/[^A-Za-z0-9]/g, '');
    return segment.slice(0, 2).toUpperCase() || fallback;
  }

  const first = parts[0].replace(/[^A-Za-z0-9]/g, '');
  const last = parts[parts.length - 1].replace(/[^A-Za-z0-9]/g, '');
  const initials = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  return initials || fallback;
}

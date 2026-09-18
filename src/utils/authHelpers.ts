import { AuthUser, ClassItem, JenjangUnit, UserRole } from '../types';
import {
  getTeacherProfiles,
  findTeachersForSubjectAndClass,
  TeacherProfile,
  TEACHER_SUBJECTS_ENTRIES,
  normalizeClassToIds,
  isTeacherNameMatch,
  normalizeSubjectKey,
} from '../data/teacherSubjectsDatabase';
import { DAFTAR_WALI_KELAS, WaliKelasEntry } from '../data/waliKelasDatabase';

export const ADMIN_PIN_KEY = 'kasyfud_darajat_admin_pin_v1';
export const DEFAULT_ADMIN_PIN = '123456';
export const AUTH_USER_KEY = 'kasyfud_darajat_auth_user_v1';

/**
 * Get the current admin PIN from storage or default
 */
export function getAdminPin(): string {
  try {
    const saved = localStorage.getItem(ADMIN_PIN_KEY);
    if (saved && saved.trim().length >= 6) {
      return saved.trim();
    }
  } catch {
    // ignore
  }
  return DEFAULT_ADMIN_PIN;
}

/**
 * Save new admin PIN (min 6 chars/digits)
 */
export function setAdminPin(newPin: string): { success: boolean; message: string } {
  if (!newPin || newPin.trim().length < 6) {
    return { success: false, message: 'PIN Administrator minimal harus 6 karakter / digit.' };
  }
  try {
    localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
    return { success: true, message: 'PIN Administrator berhasil diperbarui.' };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan PIN ke penyimpanan lokal.' };
  }
}

/**
 * Verify admin PIN
 */
export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = getAdminPin();
  return enteredPin.trim() === currentPin;
}

/**
 * Get saved user session
 */
export function getSavedAuthUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Save user session
 */
export function saveAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Get teachers filtered by unit/jenjang
 */
export function getTeachersByJenjang(unit: JenjangUnit): TeacherProfile[] {
  const profiles = getTeacherProfiles();
  if (unit === 'TMMIA') {
    // TMMIA mencakup seluruh tingkatan (Tingkat SMP & Tingkat SMA)
    return profiles;
  }
  return profiles.filter((t) => t.units.includes(unit));
}

/**
 * Get wali kelas filtered by unit/jenjang
 */
export function getWaliKelasByJenjang(unit: JenjangUnit): WaliKelasEntry[] {
  return DAFTAR_WALI_KELAS.filter((w) => {
    if (unit === 'SMP') {
      return w.unit === 'SMP' || w.levelLabel?.toLowerCase().includes('smp');
    }
    if (unit === 'SMA') {
      return w.unit === 'SMA' || w.levelLabel?.toLowerCase().includes('sma');
    }
    if (unit === 'TMMIA') {
      // TMMIA mencakup seluruh jenjang SMP dan SMA
      return true;
    }
    return true;
  });
}

/**
 * Match a class name or class ID from database with the app's ClassItem list
 */
export function matchClassItem(
  classNameOrId: string,
  classes: ClassItem[]
): ClassItem | undefined {
  if (!classNameOrId) return undefined;
  const raw = classNameOrId.toLowerCase().trim();

  // 1. Direct ID match
  const byId = classes.find((c) => c.id.toLowerCase() === raw);
  if (byId) return byId;

  // 2. Direct NameLatin match
  const byName = classes.find((c) => c.nameLatin.toLowerCase() === raw);
  if (byName) return byName;

  // 3. Normalization search
  // e.g. "1 A Tahfiz Putri" matches "1a", "2 INT IPA" matches "2int-a", "5 A IPA Putri" matches "5a"
  const clean = raw.replace(/[^a-z0-9]/g, '');

  return classes.find((c) => {
    const cIdClean = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cNameClean = c.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      cIdClean === clean ||
      cNameClean.includes(clean) ||
      clean.includes(cIdClean) ||
      clean.includes(cNameClean)
    );
  });
}

/**
 * Determine which JenjangUnit a class belongs to (SMP, SMA, or TMMIA)
 */
export function getJenjangForClass(cls: { id: string; level?: string; nameLatin?: string }): JenjangUnit {
  const id = (cls.id || '').toLowerCase();
  const lvl = (cls.level || '').toLowerCase();
  const name = (cls.nameLatin || '').toLowerCase();

  // 1. TMMIA / Intensif
  if (
    id.includes('int') ||
    lvl.includes('int') ||
    name.includes('intensif') ||
    name.includes('2int') ||
    name.includes('3int') ||
    name.includes('1int') ||
    name.includes('tmmia')
  ) {
    return 'TMMIA';
  }

  // 2. Full Day Check
  if (name.includes('full day') || id.includes('fd')) {
    if (name.includes('vii') || name.includes('ix') || name.includes('smp')) {
      return 'SMP';
    }
    if (name.includes('x ') || name.includes('xi') || name.includes('xii') || name.includes('sma')) {
      return 'SMA';
    }
    return 'TMMIA';
  }

  // 3. SMP Check (1, 2, 3)
  if (
    id.startsWith('1') ||
    id.startsWith('2') ||
    id.startsWith('3') ||
    lvl === '1' ||
    lvl === '2' ||
    lvl === '3' ||
    name.includes('smp')
  ) {
    return 'SMP';
  }

  // 4. SMA Check (4, 5, 6)
  if (
    id.startsWith('4') ||
    id.startsWith('5') ||
    id.startsWith('6') ||
    lvl === '4' ||
    lvl === '5' ||
    lvl === '6' ||
    name.includes('sma')
  ) {
    return 'SMA';
  }

  return 'SMP';
}

/**
 * Get comprehensive assignment details for a teacher cross-referenced with Master Penugasan Guru
 */
export function getTeacherAssignmentDetails(
  teacherName: string,
  classes: ClassItem[]
): {
  assignedClassIds: string[];
  assignedClassIdsByUnit: Record<JenjangUnit, string[]>;
  availableUnits: JenjangUnit[];
  assignedSubjectNames: string[];
  homeroomClass?: ClassItem;
  homeroomEntry?: WaliKelasEntry;
  totalClassesCount: number;
} {
  const assignedClassIdSet = new Set<string>();
  const subjectNameSet = new Set<string>();
  const availableUnitsSet = new Set<JenjangUnit>();

  const assignedClassIdsByUnit: Record<JenjangUnit, string[]> = {
    SMP: [],
    SMA: [],
    TMMIA: [],
  };

  // 1. Cross-reference Teacher Subjects Database (Master Penugasan Guru)
  TEACHER_SUBJECTS_ENTRIES.forEach((entry) => {
    const isTeacher = entry.guruPengampu.some((g) => isTeacherNameMatch(g, teacherName));

    if (isTeacher) {
      subjectNameSet.add(entry.namaMapel);
      const entryUnit: JenjangUnit = entry.unit || 'SMP';
      availableUnitsSet.add(entryUnit);

      // Map each class in entry.daftarKelas to verified ClassItem IDs
      entry.daftarKelas.forEach((clsStr) => {
        const matchedIds = normalizeClassToIds(clsStr);
        if (matchedIds.length > 0) {
          matchedIds.forEach((targetId) => {
            const classObj = classes.find((c) => c.id === targetId);
            if (classObj) {
              const targetJenjang = getJenjangForClass(classObj);
              assignedClassIdSet.add(targetId);
              availableUnitsSet.add(targetJenjang);
              if (!assignedClassIdsByUnit[targetJenjang].includes(targetId)) {
                assignedClassIdsByUnit[targetJenjang].push(targetId);
              }
            }
          });
        } else {
          // Attempt standard matchClassItem
          const matched = matchClassItem(clsStr, classes);
          if (matched) {
            assignedClassIdSet.add(matched.id);
            const matchedJenjang = getJenjangForClass(matched);
            availableUnitsSet.add(matchedJenjang);
            if (!assignedClassIdsByUnit[matchedJenjang].includes(matched.id)) {
              assignedClassIdsByUnit[matchedJenjang].push(matched.id);
            }
          }
        }
      });
    }
  });

  // 2. Cross-reference Wali Kelas Database
  const homeroomEntry = DAFTAR_WALI_KELAS.find((w) => isTeacherNameMatch(w.waliName, teacherName));

  let homeroomClass: ClassItem | undefined;
  if (homeroomEntry) {
    let wUnit: JenjangUnit = 'SMP';
    if (homeroomEntry.unit === 'SMP') wUnit = 'SMP';
    else if (homeroomEntry.unit === 'SMA') wUnit = 'SMA';
    else if (homeroomEntry.unit === 'INTENSIF' || homeroomEntry.unit === 'FULL DAY') {
      if (homeroomEntry.className.toLowerCase().includes('vii') || homeroomEntry.className.toLowerCase().includes('ix')) {
        wUnit = 'SMP';
      } else if (homeroomEntry.className.toLowerCase().includes('x ')) {
        wUnit = 'SMA';
      } else {
        wUnit = 'TMMIA';
      }
    }
    availableUnitsSet.add(wUnit);

    homeroomClass =
      classes.find(
        (c) =>
          (homeroomEntry.classId && c.id === homeroomEntry.classId) ||
          c.nameLatin.toLowerCase().includes(homeroomEntry.className.toLowerCase())
      ) ||
      classes.find((c) => {
        const cClean = c.id.toLowerCase();
        const wClean = (homeroomEntry.classId || '').toLowerCase();
        return cClean === wClean;
      });

    if (homeroomClass) {
      assignedClassIdSet.add(homeroomClass.id);
      if (!assignedClassIdsByUnit[wUnit].includes(homeroomClass.id)) {
        assignedClassIdsByUnit[wUnit].push(homeroomClass.id);
      }
    }
  }

  // Determine availableUnits sorted
  const unitOrder: JenjangUnit[] = ['SMP', 'SMA', 'TMMIA'];
  const availableUnits = unitOrder.filter((u) => availableUnitsSet.has(u));

  if (availableUnits.length === 0) {
    availableUnits.push('SMP');
  }

  const assignedClassIds = Array.from(assignedClassIdSet);

  return {
    assignedClassIds,
    assignedClassIdsByUnit,
    availableUnits,
    assignedSubjectNames: Array.from(subjectNameSet),
    homeroomClass,
    homeroomEntry,
    totalClassesCount: assignedClassIds.length,
  };
}

/**
 * Filter classes for a user based on active Jenjang and assigned classes.
 * - Admin: All classes in that Jenjang
 * - Guru / Wali Kelas: STRICTLY ONLY the classes where the user is explicitly assigned
 *   as Subject Teacher (or Homeroom). If none are assigned in this jenjang, returns [].
 */
export function getClassesForUserAndJenjang(
  user: AuthUser | null,
  activeJenjang: JenjangUnit,
  allClasses: ClassItem[]
): ClassItem[] {
  // TMMIA mencakup seluruh tingkatan (Tingkat SMP & Tingkat SMA)
  const jenjangClasses =
    activeJenjang === 'TMMIA'
      ? allClasses
      : allClasses.filter((c) => getJenjangForClass(c) === activeJenjang);

  if (!user || user.role === 'admin') {
    return jenjangClasses;
  }

  // If activeJenjang is TMMIA, check all assigned classes across SMP & SMA
  if (activeJenjang === 'TMMIA') {
    if (user.assignedClassIds && user.assignedClassIds.length > 0) {
      return allClasses.filter((c) => user.assignedClassIds!.includes(c.id));
    }
    return [];
  }

  // Check assigned classes for this unit from Penugasan Guru
  const assignedInThisUnit = user.assignedClassIdsByUnit?.[activeJenjang] || [];

  if (assignedInThisUnit.length > 0) {
    return jenjangClasses.filter((c) => assignedInThisUnit.includes(c.id));
  }

  // Fallback: check general assignedClassIds
  if (user.assignedClassIds && user.assignedClassIds.length > 0) {
    const filtered = jenjangClasses.filter((c) => user.assignedClassIds!.includes(c.id));
    if (filtered.length > 0) return filtered;
  }

  // If user has NO assigned classes in this jenjang, return [] to strictly prevent unauthorized viewing
  return [];
}

/**
 * Check whether a user is authorized to edit grades for a given subject in a class
 */
export function canUserEditSubject(
  user: AuthUser | null,
  subjectNameOrId: string,
  classNameOrId: string
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const assignedTeachers = findTeachersForSubjectAndClass(subjectNameOrId, classNameOrId);
  if (assignedTeachers.length === 0) {
    // If no teacher is specifically listed in database, check if teacher's assigned subjects match
    const targetSubKey = normalizeSubjectKey(subjectNameOrId);
    return (user.assignedSubjectNames || []).some((s) => {
      const entrySubKey = normalizeSubjectKey(s);
      return entrySubKey === targetSubKey || entrySubKey.includes(targetSubKey) || targetSubKey.includes(entrySubKey);
    });
  }

  return assignedTeachers.some((t) => isTeacherNameMatch(t, user.name));
}

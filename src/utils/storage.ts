import { NoteItem, UserProfile } from '../types';
import { SAMPLE_NOTES } from '../data/sampleNotes';

const STORAGE_KEY_NOTES = 'zygard_student_notes_v1';
const STORAGE_KEY_ACTIVE_ID = 'zygard_active_note_id_v1';
const STORAGE_KEY_USER = 'zygard_student_profile_v1';

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load user profile', e);
  }
  return null;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save user profile', e);
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (e) {
    console.warn('Failed to clear user profile', e);
  }
}

export function loadSavedNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load notes from localStorage', e);
  }

  // Default initial note from sample
  const initial: NoteItem = {
    id: SAMPLE_NOTES[0].id,
    title: SAMPLE_NOTES[0].title,
    subject: SAMPLE_NOTES[0].subject,
    content: SAMPLE_NOTES[0].content,
    createdAt: Date.now(),
  };

  saveNotes([initial]);
  return [initial];
}

export function saveNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.warn('Failed to save notes to localStorage', e);
  }
}

export function getActiveNoteId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function setActiveNoteId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch {
    // noop
  }
}

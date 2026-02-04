import React, { useState } from 'react';
import type { ThemeMode } from '../types/models';
import type { Language } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { TextField } from './ui/TextField';
import { SHORTCUT_DEFS, type ShortcutActionId, getDefaultShortcutBinding } from '../shortcuts/definitions';
import { eventToShortcutString, formatShortcutForDisplay } from '../shortcuts/keys';

export function SettingsModal(props: {
  themeMode: ThemeMode;
  language: Language;
  ignoreFrontmatter: boolean;
  shortcuts: Record<string, string>;
  onChangeTheme: (mode: ThemeMode) => void;
  onChangeLanguage: (lang: Language) => void;
  onChangeIgnoreFrontmatter: (v: boolean) => void;
  onChangeShortcuts: (shortcuts: Record<string, string>) => void;
  onClose: () => void;
}) {
  const { t } = useI18n(props.language);
  const [mode, setMode] = useState<ThemeMode>(props.themeMode);
  const [lang, setLang] = useState<Language>(props.language);
  const [ignoreFrontmatter, setIgnoreFrontmatter] = useState<boolean>(props.ignoreFrontmatter);
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => ({ ...(props.shortcuts ?? {}) }));

  return (
    <Modal
      title={t('dialog.settings.title')}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="secondary" onClick={props.onClose}>
            {t('dialog.settings.cancel')}
          </Button>
          <Button
            onClick={() => {
              props.onChangeTheme(mode);
              props.onChangeLanguage(lang);
              props.onChangeIgnoreFrontmatter(ignoreFrontmatter);
              props.onChangeShortcuts(shortcuts);
              props.onClose();
            }}
          >
            {t('dialog.settings.save')}
          </Button>
        </>
      }
    >
      <div className="row">
        <div className="subtle">{t('dialog.settings.theme')}</div>
        <Select value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}>
          <option value="system">{t('theme.system')}</option>
          <option value="light">{t('theme.light')}</option>
          <option value="dark">{t('theme.dark')}</option>
        </Select>
      </div>

      <div className="row">
        <div className="subtle">{t('dialog.settings.language')}</div>
        <Select value={lang} onChange={(e) => setLang(e.target.value as Language)}>
          <option value="zh-CN">{t('lang.zh')}</option>
          <option value="en">{t('lang.en')}</option>
        </Select>
      </div>

      <div className="row" style={{ alignItems: 'center' }}>
        <div className="subtle">{t('dialog.settings.ignoreFrontmatter')}</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={ignoreFrontmatter}
            onChange={(e) => setIgnoreFrontmatter(e.target.checked)}
          />
        </label>
      </div>

      <div className="subtle" style={{ marginTop: 10 }}>
        <strong style={{ color: 'var(--text-1)' }}>{t('dialog.settings.shortcuts')}</strong>
        <div>{t('dialog.settings.shortcutsTip')}</div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
        {SHORTCUT_DEFS.map((def) => {
          const id = def.id as ShortcutActionId;
          const hasOwn = Object.prototype.hasOwnProperty.call(shortcuts, id);
          const raw = hasOwn ? shortcuts[id] : undefined;
          const defaultBinding = getDefaultShortcutBinding(id);
          const placeholder = formatShortcutForDisplay(defaultBinding);

          // undefined => follow default; '' => disabled; string => custom
          const effective = raw === undefined ? defaultBinding : raw;
          const display = effective ? formatShortcutForDisplay(effective) : '';

          return (
            <div key={id} className="row" style={{ alignItems: 'center', gap: 10 }}>
              <div className="subtle" style={{ minWidth: 160 }}>
                {t(def.labelKey as any)}
              </div>
              <TextField
                value={display}
                placeholder={placeholder}
                readOnly
                onKeyDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const s = eventToShortcutString(e.nativeEvent);
                  if (!s) return;
                  setShortcuts((prev) => ({ ...prev, [id]: s }));
                }}
                onFocus={(e) => {
                  // keep caret hidden since readOnly
                  (e.currentTarget as HTMLInputElement).select();
                }}
                style={{ flex: 1 }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShortcuts((prev) => ({ ...prev, [id]: '' }))}
              >
                {t('dialog.settings.shortcutsClear')}
              </Button>
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShortcuts({});
            }}
          >
            {t('dialog.settings.shortcutsReset')}
          </Button>
        </div>
      </div>

      <div className="subtle" style={{ lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-1)' }}>{t('dialog.settings.privacyTitle')}</strong>
        <div>{t('dialog.settings.privacyBody')}</div>
      </div>
    </Modal>
  );
}

import React, { useState } from 'react';
import type { ThemeMode } from '../types/models';
import type { Language } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

export function SettingsModal(props: {
  themeMode: ThemeMode;
  language: Language;
  onChangeTheme: (mode: ThemeMode) => void;
  onChangeLanguage: (lang: Language) => void;
  onClose: () => void;
}) {
  const { t } = useI18n(props.language);
  const [mode, setMode] = useState<ThemeMode>(props.themeMode);
  const [lang, setLang] = useState<Language>(props.language);

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

      <div className="subtle" style={{ lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-1)' }}>{t('dialog.settings.privacyTitle')}</strong>
        <div>{t('dialog.settings.privacyBody')}</div>
      </div>
    </Modal>
  );
}

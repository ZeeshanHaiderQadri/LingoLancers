import React from 'react';
import ParameterPanel from './panels/parameter-panel';
import TemplatePanel from './panels/template-panel';
import TransitionPanel from './panels/transition-panel';
import FusionPanel from './panels/fusion-panel';
import ExtendPanel from './panels/extend-panel';
import SoundPanel from './panels/sound-panel';
import SpeechPanel from './panels/speech-panel';
import RestylePanel from './panels/restyle-panel';
import CharacterPanel from './panels/character-panel';

export default function MiddlePanel({ activeMode }: { activeMode: string }) {
  const renderPanel = () => {
    switch (activeMode) {
      case 'Image or Text':
        return <ParameterPanel />;
      case 'Template':
        return <TemplatePanel />;
      case 'Transition':
        return <TransitionPanel />;
      case 'Fusion':
        return <FusionPanel />;
      case 'Extend':
        return <ExtendPanel />;
      case 'Sound':
        return <SoundPanel />;
      case 'Speech':
        return <SpeechPanel />;
      case 'Restyle':
        return <RestylePanel />;
      case 'Character':
        return <CharacterPanel />;
      default:
        return <ParameterPanel />;
    }
  };

  return <div className="space-y-6">{renderPanel()}</div>;
}
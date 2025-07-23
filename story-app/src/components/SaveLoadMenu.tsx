import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import type { SaveSlot } from '../types';
import './SaveLoadMenu.css';

interface SaveLoadMenuProps {
  mode: 'save' | 'load';
  onClose: () => void;
}

export const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ mode, onClose }) => {
  const { saveSlots, saveGame, loadGame, gameState } = useGameContext();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [saveName, setSaveName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // セーブスロットの最大数（SaveSystemから取得）
  const maxSlots = 10;

  // 空のスロットを含む全スロットリストを生成
  const allSlots: (SaveSlot | null)[] = Array.from({ length: maxSlots }, (_, index) => {
    const slotId = index + 1;
    return saveSlots.find(slot => slot.id === slotId) || null;
  });

  const handleSlotClick = (slotId: number) => {
    setSelectedSlot(slotId);
    setError(null);
  };

  const handleSave = async () => {
    if (selectedSlot === null) {
      setError('セーブスロットを選択してください');
      return;
    }

    if (!gameState) {
      setError('セーブするゲームデータがありません');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await saveGame(selectedSlot);
      alert('ゲームを保存しました');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セーブに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoad = async () => {
    if (selectedSlot === null) {
      setError('ロードするスロットを選択してください');
      return;
    }

    const slot = allSlots[selectedSlot - 1];
    if (!slot) {
      setError('選択されたスロットにセーブデータがありません');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await loadGame(selectedSlot);
      alert('ゲームをロードしました');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ロードに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  return (
    <div className="save-load-menu">
      <div className="save-load-header">
        <h2>{mode === 'save' ? 'ゲームを保存' : 'ゲームをロード'}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="save-slots-container">
        {allSlots.map((slot, index) => {
          const slotId = index + 1;
          const isSelected = selectedSlot === slotId;
          const isEmpty = !slot;

          return (
            <div
              key={slotId}
              className={`save-slot ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : 'filled'}`}
              onClick={() => handleSlotClick(slotId)}
            >
              <div className="slot-header">
                <span className="slot-number">スロット {slotId}</span>
                {!isEmpty && (
                  <span className="slot-date">{formatDate(slot.updatedAt)}</span>
                )}
              </div>

              {isEmpty ? (
                <div className="slot-content empty-content">
                  <span>空のスロット</span>
                </div>
              ) : (
                <div className="slot-content">
                  <div className="save-name">{slot.name}</div>
                  <div className="save-details">
                    <span>物語: {slot.gameState.storyId}</span>
                    <span>プレイ時間: {formatPlayTime(slot.gameState.playTime)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mode === 'save' && selectedSlot && (
        <div className="save-name-input">
          <label htmlFor="saveName">セーブ名:</label>
          <input
            id="saveName"
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={`セーブデータ ${selectedSlot}`}
            maxLength={50}
          />
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="save-load-actions">
        <button
          className="action-button"
          onClick={mode === 'save' ? handleSave : handleLoad}
          disabled={selectedSlot === null || isProcessing || (mode === 'load' && !allSlots[selectedSlot - 1])}
        >
          {isProcessing ? '処理中...' : mode === 'save' ? '保存' : 'ロード'}
        </button>
        <button className="cancel-button" onClick={onClose}>
          キャンセル
        </button>
      </div>
    </div>
  );
};
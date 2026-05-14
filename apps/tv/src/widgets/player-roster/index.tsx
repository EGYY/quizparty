/**
 * PlayerRoster — сетка карточек игроков 4×N.
 *
 * Показывает max(playerCount, 8) слотов, но не больше maxPlayers.
 * При 1 игроке и maxPlayers=10 → 8 слотов (2 ряда по 4 = полная сетка).
 * При >8 игроках — добавляются ряды.
 *
 * Логика buildPlayerSlots живёт здесь: это presentation-логика виджета.
 */
import { memo, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { type Player } from '@quizparty/shared';
import { PlayerCard, type PlayerSlot } from '@entities/player';

const MIN_VISIBLE = 10; // минимальное число слотов (чтобы сетка выглядела заполненной)

function buildPlayerSlots(players: Player[], maxPlayers: number): PlayerSlot[] {
  const playerItems = players.map(player => ({
    kind: 'player' as const,
    player,
  }));
  const totalVisible = Math.min(
    Math.max(playerItems.length, MIN_VISIBLE),
    maxPlayers,
  );
  const emptyCount = totalVisible - playerItems.length;
  const emptyItems = Array.from({ length: emptyCount }, (_, i) => ({
    kind: 'empty' as const,
    index: i,
  }));
  return [...playerItems, ...emptyItems];
}

type Props = {
  maxPlayers: number;
  players: Player[];
};

export const PlayerRoster = memo(function PlayerRoster({
  players,
  maxPlayers,
}: Props) {
  const slots = useMemo(
    () => buildPlayerSlots(players, maxPlayers),
    [players, maxPlayers],
  );

  return (
    <View style={styles.grid}>
      {slots.map((slot, index) => (
        <PlayerCard
          key={
            slot.kind === 'player'
              ? slot.player.playerId
              : `empty-${slot.index}`
          }
          index={index}
          slot={slot}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    maxWidth: Dimensions.get('screen').width / 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

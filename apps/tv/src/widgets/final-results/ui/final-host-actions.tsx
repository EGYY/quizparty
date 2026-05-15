import { Image, StyleSheet, Text, View } from 'react-native';
import type { ReactionEvent } from '@quizparty/shared';
import { finalHostCheer } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { Focusable } from '@shared/ui/focusable';

export function FinalHostActions({
  onChooseQuiz,
  onPlayAgain,
  reactions,
}: {
  onChooseQuiz: () => void;
  onPlayAgain: () => void;
  reactions: ReactionEvent[];
}) {
  const visibleReactions = reactions.slice(-6);

  return (
    <>
      <View style={[styles.hostStage]}>
        <View style={[styles.reactionLayer]}>
          {visibleReactions.map(reaction => (
            <AnimatedReactionBubble
              key={reaction.id}
              range="finalHost"
              reaction={reaction}
            />
          ))}
        </View>
        <View style={[styles.hostCrop]}>
          <Image
            resizeMode="contain"
            source={finalHostCheer}
            style={[styles.hostImage]}
          />
        </View>
      </View>

      <View style={[styles.actions]}>
        <Focusable
          hasTVPreferredFocus
          onPress={onPlayAgain}
          style={[styles.primaryButton]}
        >
          <Text style={[styles.primaryButtonText]}>▶ Играть еще</Text>
        </Focusable>
        <Focusable onPress={onChooseQuiz} style={[styles.secondaryButton]}>
          <Text style={[styles.secondaryButtonText]}>
            🎲 Выбрать другой квиз
          </Text>
        </Focusable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hostStage: {
    width: s(430),
    height: sv(330),
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: sv(4),
    marginBottom: sv(-10),
  },
  reactionLayer: {
    position: 'absolute',
    top: sv(8),
    right: 0,
    width: s(420),
    height: sv(245),
    zIndex: 4,
  },
  hostCrop: {
    width: s(430),
    height: sv(330),
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hostImage: {
    width: s(430),
    height: sv(470),
    marginBottom: sv(-88),
  },
  actions: {
    width: '100%',
    maxWidth: s(590),
    gap: s(14),
  },
  primaryButton: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: '#ffd166',
    paddingVertical: sv(24),
    shadowColor: colors.gold,
    shadowOpacity: 0.65,
    shadowRadius: s(20),
    shadowOffset: { width: 0, height: 0 },
  },
  primaryButtonText: {
    color: colors.textDark,
    fontSize: sf(38),
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#c36dff',
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: 'rgba(130, 65, 220, 0.9)',
    paddingVertical: sv(21),
    shadowColor: '#b174ff',
    shadowOpacity: 0.85,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: sf(30),
    fontWeight: '900',
  },
});

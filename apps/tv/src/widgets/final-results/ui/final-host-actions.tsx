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
    <View style={[styles.wrap]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: s(650),
    minHeight: sv(238),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: s(16),
  },
  hostStage: {
    width: s(230),
    height: sv(238),
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  reactionLayer: {
    position: 'absolute',
    top: sv(2),
    right: s(-10),
    width: s(250),
    height: sv(180),
    zIndex: 4,
  },
  hostCrop: {
    width: s(230),
    height: sv(238),
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hostImage: {
    width: s(270),
    height: sv(320),
    marginBottom: sv(-60),
  },
  actions: {
    flex: 1,
    minWidth: 0,
    maxWidth: s(400),
    gap: s(10),
  },
  primaryButton: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: '#ffd166',
    paddingVertical: sv(18),
    shadowColor: colors.gold,
    shadowOpacity: 0.65,
    shadowRadius: s(20),
    shadowOffset: { width: 0, height: 0 },
  },
  primaryButtonText: {
    color: colors.textDark,
    fontSize: sf(30),
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#c36dff',
    borderRadius: 999,
    borderWidth: s(4),
    backgroundColor: 'rgba(130, 65, 220, 0.9)',
    paddingVertical: sv(15),
    shadowColor: '#b174ff',
    shadowOpacity: 0.85,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: sf(24),
    fontWeight: '900',
  },
});

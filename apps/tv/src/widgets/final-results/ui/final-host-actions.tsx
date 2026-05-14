import { Image, StyleSheet, Text, View } from 'react-native';
import type { ReactionEvent } from '@quizparty/shared';
import { finalHostCheer } from '@shared/assets/images';
import { colors } from '@shared/config/theme';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { Focusable } from '@shared/ui/focusable';

export function FinalHostActions({
  compact,
  onChooseQuiz,
  onPlayAgain,
  reactions,
}: {
  compact: boolean;
  onChooseQuiz: () => void;
  onPlayAgain: () => void;
  reactions: ReactionEvent[];
}) {
  const visibleReactions = reactions.slice(-6);

  return (
    <>
      <View style={[styles.hostStage, compact && styles.hostStage_compact]}>
        <View
          style={[
            styles.reactionLayer,
            compact && styles.reactionLayer_compact,
          ]}
        >
          {visibleReactions.map(reaction => (
            <AnimatedReactionBubble
              key={reaction.id}
              range="finalHost"
              reaction={reaction}
            />
          ))}
        </View>
        <View style={[styles.hostCrop, compact && styles.hostCrop_compact]}>
          <Image
            resizeMode="contain"
            source={finalHostCheer}
            style={[styles.hostImage, compact && styles.hostImage_compact]}
          />
        </View>
      </View>

      <View style={[styles.actions, compact && styles.actions_compact]}>
        <Focusable
          hasTVPreferredFocus
          onPress={onPlayAgain}
          style={[
            styles.primaryButton,
            compact && styles.primaryButton_compact,
          ]}
        >
          <Text
            style={[
              styles.primaryButtonText,
              compact && styles.primaryButtonText_compact,
            ]}
          >
            ▶ Играть еще
          </Text>
        </Focusable>
        <Focusable
          onPress={onChooseQuiz}
          style={[
            styles.secondaryButton,
            compact && styles.secondaryButton_compact,
          ]}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              compact && styles.secondaryButtonText_compact,
            ]}
          >
            🎲 Выбрать другой квиз
          </Text>
        </Focusable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hostStage: {
    width: 430,
    height: 330,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginBottom: -10,
  },
  hostStage_compact: {
    width: 310,
    height: 230,
    marginBottom: -7,
  },
  reactionLayer: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: 420,
    height: 245,
    zIndex: 4,
  },
  reactionLayer_compact: {
    width: 308,
    height: 178,
  },
  hostCrop: {
    width: 430,
    height: 330,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hostCrop_compact: {
    width: 310,
    height: 230,
  },
  hostImage: {
    width: 430,
    height: 470,
    marginBottom: -88,
  },
  hostImage_compact: {
    width: 310,
    height: 340,
    marginBottom: -64,
  },
  actions: {
    width: '100%',
    maxWidth: 590,
    gap: 14,
  },
  actions_compact: {
    maxWidth: 390,
    gap: 9,
  },
  primaryButton: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: 4,
    backgroundColor: '#ffd166',
    paddingVertical: 24,
    shadowColor: colors.gold,
    shadowOpacity: 0.65,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryButton_compact: {
    borderWidth: 3,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: colors.textDark,
    fontSize: 38,
    fontWeight: '900',
  },
  primaryButtonText_compact: {
    fontSize: 24,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#c36dff',
    borderRadius: 999,
    borderWidth: 4,
    backgroundColor: 'rgba(130, 65, 220, 0.9)',
    paddingVertical: 21,
    shadowColor: '#b174ff',
    shadowOpacity: 0.85,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  secondaryButton_compact: {
    borderWidth: 3,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  secondaryButtonText_compact: {
    fontSize: 19,
  },
});

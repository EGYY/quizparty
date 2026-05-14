import { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Video, { type VideoRef } from 'react-native-video';
import { MediaType, type Media } from '@quizparty/shared';
import { colors } from '@shared/config/theme';

export function TvMediaPlayer({
  compact,
  fallbackIcon = '?',
  media,
  variant = 'question',
  overrideWidth,
  overrideHeight,
}: {
  compact: boolean;
  fallbackIcon?: string;
  media: Media | undefined;
  variant?: 'question' | 'reveal' | 'question-av';
  overrideWidth?: number;
  overrideHeight?: number;
}) {
  const [paused, setPaused] = useState(false);
  const didSeekRef = useRef(false);
  const videoRef = useRef<VideoRef | null>(null);

  const hasOverride =
    typeof overrideWidth === 'number' && typeof overrideHeight === 'number';

  const frameStyle = hasOverride
    ? [
        styles.frame_media,
        {
          width: overrideWidth,
          height: overrideHeight,
          borderRadius: 0,
          marginBottom: 0,
        },
      ]
    : [
        styles.frame,
        styles.frame_media,
        variant === 'reveal' && styles.frame_reveal,
        variant === 'question-av' && styles.frame_questionAv,
        variant === 'question-av' && compact && styles.frame_questionAv_compact,
        variant !== 'question-av' && compact && styles.frame_compact,
      ];

  if (!media) {
    return (
      <View
        style={
          hasOverride
            ? frameStyle
            : [styles.frame, compact && styles.frame_compact]
        }
      >
        <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
      </View>
    );
  }

  if (media.type === MediaType.IMAGE) {
    return (
      <View
        style={
          hasOverride
            ? frameStyle
            : [styles.frame, compact && styles.frame_compact]
        }
      >
        <Image
          resizeMode="cover"
          source={{ uri: media.url }}
          style={styles.image}
        />
      </View>
    );
  }

  const startSeconds = (media.startMs ?? 0) / 1000;
  const endSeconds =
    typeof media.endMs === 'number' ? media.endMs / 1000 : undefined;
  const isAudio = media.type === MediaType.AUDIO;

  return (
    <View style={frameStyle}>
      {isAudio ? (
        <View style={styles.audioScene}>
          <Text
            style={[styles.mediaKicker, compact && styles.mediaKicker_compact]}
          >
            {media.prompt ??
              (variant === 'reveal'
                ? 'Расширенный фрагмент'
                : 'Слушайте фрагмент')}
          </Text>
          <View style={styles.audioBars}>
            {Array.from({ length: 13 }, (_, index) => (
              <View
                key={index}
                style={[styles.audioBar, { height: 24 + ((index * 17) % 58) }]}
              />
            ))}
          </View>
          <Text style={[styles.mediaHint, compact && styles.mediaHint_compact]}>
            AUDIO
          </Text>
          <Video
            paused={paused}
            ref={videoRef}
            source={{ uri: media.url }}
            style={styles.hiddenVideo}
            onLoad={() => {
              if (!didSeekRef.current && startSeconds > 0) {
                didSeekRef.current = true;
                videoRef.current?.seek(startSeconds);
              }
            }}
            onProgress={event => {
              if (endSeconds && event.currentTime >= endSeconds)
                setPaused(true);
            }}
          />
        </View>
      ) : (
        <Video
          controls
          paused={paused}
          ref={videoRef}
          resizeMode="cover"
          source={{ uri: media.url }}
          style={styles.video}
          onLoad={() => {
            if (!didSeekRef.current && startSeconds > 0) {
              didSeekRef.current = true;
              videoRef.current?.seek(startSeconds);
            }
          }}
          onProgress={event => {
            if (endSeconds && event.currentTime >= endSeconds) setPaused(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 430,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(255, 210, 142, 0.7)',
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    marginBottom: 20,
  },
  frame_compact: {
    width: 292,
    height: 92,
    marginBottom: 10,
  },
  frame_media: {
    backgroundColor: 'rgba(15, 22, 45, 0.92)',
  },
  frame_reveal: {
    width: 340,
    height: 132,
    marginTop: 16,
    marginBottom: 0,
  },
  frame_questionAv: {
    width: 620,
    height: 220,
    marginBottom: 20,
  },
  frame_questionAv_compact: {
    width: 440,
    height: 160,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  hiddenVideo: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  audioScene: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  audioBars: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  audioBar: {
    width: 10,
    borderRadius: 999,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  fallbackIcon: {
    color: colors.gold,
    fontSize: 70,
    fontWeight: '900',
  },
  mediaKicker: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  mediaKicker_compact: {
    fontSize: 14,
  },
  mediaHint: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  mediaHint_compact: {
    fontSize: 10,
  },
});

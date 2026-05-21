import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Video, { type VideoRef } from 'react-native-video';
import { MediaType, type Media } from '@quizparty/shared';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { getMediaUrl } from '@shared/lib/media';

export function TvMediaPlayer({
  fallbackIcon = '?',
  forcePaused = false,
  media,
  variant = 'question',
  overrideWidth,
  overrideHeight,
}: {
  fallbackIcon?: string;
  forcePaused?: boolean;
  media: Media | undefined;
  variant?: 'question' | 'reveal' | 'question-av';
  overrideWidth?: number;
  overrideHeight?: number;
}) {
  const [pausedState, setPausedState] = useState({
    mediaKey: 'empty',
    paused: false,
  });
  const didSeekRef = useRef(false);
  const previousMediaKeyRef = useRef('empty');
  const videoRef = useRef<VideoRef | null>(null);
  const mediaKey = media
    ? `${media.type}:${media.url}:${media.startMs ?? 0}:${media.endMs ?? 'end'}`
    : 'empty';

  if (previousMediaKeyRef.current !== mediaKey) {
    previousMediaKeyRef.current = mediaKey;
    didSeekRef.current = false;
  }

  const paused =
    forcePaused ||
    (pausedState.mediaKey === mediaKey ? pausedState.paused : false);

  useEffect(() => {
    setPausedState(current => {
      if (current.mediaKey === mediaKey && !current.paused) return current;
      return { mediaKey, paused: false };
    });
  }, [mediaKey]);
  const resolvedUrl = media ? getMediaUrl(media.url) : undefined;
  const videoSource = useMemo(
    () => (resolvedUrl ? { uri: resolvedUrl } : undefined),
    [resolvedUrl],
  );

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
      ];

  if (!media) {
    return (
      <View style={hasOverride ? frameStyle : [styles.frame]}>
        <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
      </View>
    );
  }

  if (media.type === MediaType.IMAGE) {
    return (
      <View style={hasOverride ? frameStyle : [styles.frame]}>
        <Image
          resizeMode="cover"
          source={{ uri: resolvedUrl! }}
          style={styles.image}
        />
      </View>
    );
  }

  const startSeconds = (media.startMs ?? 0) / 1000;
  const endSeconds =
    typeof media.endMs === 'number' ? media.endMs / 1000 : undefined;
  const isAudio = media.type === MediaType.AUDIO;

  const handleLoad = () => {
    if (!didSeekRef.current && startSeconds > 0) {
      didSeekRef.current = true;
      videoRef.current?.seek(startSeconds);
    }
  };

  const handleProgress = (event: { currentTime: number }) => {
    if (endSeconds != null && event.currentTime >= endSeconds) {
      setPausedState(current => {
        if (current.mediaKey === mediaKey && current.paused) return current;
        return { mediaKey, paused: true };
      });
    }
  };

  return (
    <View style={frameStyle}>
      {isAudio ? (
        <View style={styles.audioScene}>
          <Text style={[styles.mediaKicker]}>
            {media.prompt ??
              (variant === 'reveal'
                ? 'Расширенный фрагмент'
                : 'Слушайте фрагмент')}
          </Text>
          <View style={styles.audioBars}>
            {Array.from({ length: 13 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.audioBar,
                  { height: sv(24 + ((index * 17) % 58)) },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.mediaHint]}>AUDIO</Text>
          <Video
            key={mediaKey}
            paused={paused}
            ref={videoRef}
            source={videoSource!}
            style={styles.hiddenVideo}
            onLoad={handleLoad}
            onProgress={handleProgress}
          />
        </View>
      ) : (
        <Video
          key={mediaKey}
          controls
          paused={paused}
          ref={videoRef}
          resizeMode="cover"
          source={videoSource!}
          style={styles.video}
          onLoad={handleLoad}
          onProgress={handleProgress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: s(430),
    height: sv(150),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(255, 210, 142, 0.7)',
    borderRadius: s(16),
    borderWidth: s(3),
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    marginBottom: sv(20),
  },
  frame_media: {
    backgroundColor: 'rgba(15, 22, 45, 0.92)',
  },
  frame_reveal: {
    width: s(340),
    height: sv(132),
    marginTop: sv(16),
    marginBottom: 0,
  },
  frame_questionAv: {
    width: s(620),
    height: sv(220),
    marginBottom: sv(20),
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
    width: s(1),
    height: sv(1),
    opacity: 0,
  },
  audioScene: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    paddingHorizontal: s(18),
  },
  audioBars: {
    height: sv(70),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(7),
  },
  audioBar: {
    width: s(10),
    borderRadius: 999,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: s(12),
    shadowOffset: { width: 0, height: 0 },
  },
  fallbackIcon: {
    color: colors.gold,
    fontSize: sf(70),
    fontWeight: '900',
  },
  mediaKicker: {
    color: colors.text,
    fontSize: sf(20),
    fontWeight: '900',
  },
  mediaHint: {
    color: colors.textSecondary,
    fontSize: sf(14),
    fontWeight: '900',
    letterSpacing: 0,
  },
});

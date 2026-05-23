import { memo } from 'react';
import { ImagePlus } from 'lucide-react';
import { resolveAssetUrl } from '@shared/lib';
import styles from './quiz-cover-thumb.module.scss';

export const QuizCoverThumb = memo(function QuizCoverThumb({
  coverUrl,
  themeColor,
}: {
  coverUrl: string | undefined;
  themeColor: string | undefined;
}) {
  const cover = resolveAssetUrl(coverUrl);

  return (
    <div className={styles.coverThumb} style={{ backgroundColor: themeColor ?? '#ffb45f' }}>
      {cover ? <img alt="" loading="lazy" src={cover} /> : <ImagePlus size={18} />}
    </div>
  );
});

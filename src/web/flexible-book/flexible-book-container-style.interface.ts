import PageStyles from '../../shared/models/page-styles.interface';

type FlexibleBookPageStyles = Omit<PageStyles, 'width' | 'height'>;

export default FlexibleBookPageStyles;

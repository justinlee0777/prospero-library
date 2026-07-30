import FontLocations from '../../../shared/models/font-locations.interface';
import PageStyles from '../../../shared/models/page-styles.interface';
import Optional from '../../../shared/utils/optional.type';
import Parser from '../models/parser.interface';

export interface IParserBuilder {
  fromPageStyles(
    containerStyle: Optional<PageStyles, 'padding' | 'margin' | 'border'>,
  ): IParserBuilder;

  setFontLocation(urlOrLocations: FontLocations): IParserBuilder;

  build(): Parser;
}

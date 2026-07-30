import FontLocations from '../../../shared/models/font-locations.interface';
import PageStyles from '../../../shared/models/page-styles.interface';
import Transformer from '../../../shared/models/transformer.interface';
import Optional from '../../../shared/utils/optional.type';
import Parser from '../models/parser.interface';

export default interface IParserBuilder {
  fromPageStyles(
    containerStyle: Optional<PageStyles, 'padding' | 'margin' | 'border'>,
  ): IParserBuilder;

  setTransformers(transformers: Array<Transformer>): IParserBuilder;

  setFontLocation(urlOrLocations: FontLocations): IParserBuilder;

  build(): Parser;
}

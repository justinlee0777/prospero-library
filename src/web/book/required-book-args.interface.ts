import GetPage from '../../shared/models/get-page.interface';
import PagesOutput from '../../shared/models/pages-output.interface';

type PageInfo = Pick<PagesOutput, 'pageStyles'>;

interface BookArgsWithGetPage extends PageInfo {
  getPage: GetPage;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

export default RequiredBookArgs;

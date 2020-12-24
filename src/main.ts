import {MetricsService} from "./metrics.service";
import {glob} from 'glob';
import * as path from "path";
const metrics = new MetricsService();

(async () => {

  // console.log(await getSourceFilePaths())
  let obj = {
    allLines: 0,
    codeLines: 0,
    emptyLines: 0,
    commentLines: 0,
    sourceLines: 0,
    commentsLevel: 0,
  };
  await metrics.readFiles('./node_modules/lodash', obj); //'./node_modules/lodash'

  console.log(obj);

})()

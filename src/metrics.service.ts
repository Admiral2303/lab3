import * as fs from 'fs';
import * as glob from 'glob';
import * as path from "path";

export class MetricsService {

  constructor() {
  }

  async getSourceFilePaths(dir) {
    return new Promise((resolve, reject) => {
      glob(dir + '/**/*.js', (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(files.map(filePath => path.join(process.cwd(), filePath)));
      });
    });
  }

  async readFiles(dirname, statistic) {
    let filenames: any = await this.getSourceFilePaths(dirname);
    filenames.forEach(filename => {
      const content = fs.readFileSync(filename);
      const fileStatistic = this.calculateLines(content.toString());
      statistic.allLines += fileStatistic.allLines;
      statistic.codeLines += fileStatistic.codeLines;
      statistic.emptyLines += fileStatistic.emptyLines;
      statistic.commentLines += fileStatistic.commentLines;
      statistic.sourceLines += this.calculateLogicLines(content.toString());

    });
    statistic.commentsLevel = Number((statistic.commentLines / statistic.codeLines).toFixed(2));
  }

  calculateLines(content: string) {
    const lines = content.split('\n');
    const notEmptyLines = lines.filter(el => el !== '');
    let commentLines = 0;
    let startCommentFlag = false;
    lines.forEach(line => {
      if (line.includes('/*')) {
        startCommentFlag = true;
      } else if (startCommentFlag) {
        commentLines++;
        if (line.includes('*/')) {
          startCommentFlag = false;
        }
      } else if (!startCommentFlag && line.includes('//')) {
        commentLines++;
      }
    });
    return {
      allLines: lines.length,
      codeLines: notEmptyLines.length,
      emptyLines: lines.length - notEmptyLines.length,
      commentLines,
    };
  }

  calculateLogicLines(content: string) {
    if (content.search(/@\/(?:[^\/]+|\/\/)*\/|\/(?:[^\/\\]+|\\.)\//gm) >= 0) {
      content = content.replace(/@\/(?:[^\/]+|\/\/)*\/|\/(?:[^\/\\]+|\\.)\//gm, ''); // remove regex
    }
    if (content.search(/(\/\*[\s\S]*?\*\/|(|^)\/\/.*$)/gm) >= 0) {
      content = content.replace(/(\/\*[\s\S]*?\*\/|(|^)\/\/.*$)/gm, ''); // remove comments
    }
    if (content.search(/@"(?:[^"]+|"")*"|"(?:[^"\\]+|\\.)"/gm) >= 0) {
      content = content.replace(/@"(?:[^"]+|"")*"|"(?:[^"\\]+|\\.)"/gm, ''); // remove strings
    }
    if (content.search(/@'(?:[^']+|'')*'|'(?:[^'\\]+|\\.)'/gm)>= 0) {
      content = content.replace(/@'(?:[^']+|'')*'|'(?:[^'\\]+|\\.)'/gm, ''); // remove strings
    }
    if (content.search(/else if/gm)>= 0) {
      content = content.replace(/else if/gm, ''); // remove else if
    }
    const bracketsCount = (content.match(/\(/gm) || []).length; // count brackets
    const closeBracketsCount = (content.match(/\)/gm) || []).length; // count brackets
    const functionsCount = bracketsCount === closeBracketsCount ? bracketsCount : Math.min(bracketsCount, closeBracketsCount);
    const notSymbolCount = (content.match(/!/gm) || []).length; // not symbol count
    const questionSymbolCount = (content.match(/\?/gm) || []).length; // question symbol count
    const twoDotsSymbolCount = (content.match(/:/gm) || []).length; // two dots symbol count
    const returnCount = (content.match(/return/gm) || []).length; // return count
    const breakCount = (content.match(/break/gm) || []).length; // break count
    const continueCount = (content.match(/continue/gm) || []).length; // continue count
    const elseCount = (content.match(/else/gm) || []).length; // else count

    return functionsCount + notSymbolCount + questionSymbolCount + twoDotsSymbolCount + returnCount +
      breakCount + continueCount + elseCount;

  }

}

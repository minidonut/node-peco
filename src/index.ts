import { spawn } from 'child_process';

const handleError = (reject: (reason?: any) => void, option: PecoOption) => (error: Error): void => {
  if (option.reject) {
    reject(error);
  } else {
    if (error.message.includes('ENOENT')) {
      // when 'peco' binary is not in path
      console.error(`command not found: peco\ninstall peco from https://github.com/peco/peco`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
};

const handleCancel = (option: PecoOption, selected: string): void => {
  if (option.onCancel === 'error' && selected === '') {
    throw new Error('canceled');
  }
};

const getBinary = (option: PecoOption): string => {
  return option.bin ?? 'peco';
};

const optionParser = (key: keyof PecoOption, cmdKey: string = key) => (option: PecoOption): string => {
  const value = option[key];
  if (value) {
    return '--' + cmdKey + '=' + String(value);
  } else {
    return '';
  }
};

const getOptions = (option: PecoOption): string[] =>
  [
    optionParser('query'),
    optionParser('prompt'),
    optionParser('rcfile'),
    optionParser('bufferSize', 'buffer-size'),
    optionParser('selectOne', 'select-1'),
    optionParser('printQuery', 'print-query'),
    optionParser('initialIndex', 'initial-index'),
    optionParser('initialFilter', 'initial-filter'),
    optionParser('selectionPrefix', 'selection-prefix'),
    optionParser('layout'),
  ]
    .map(parse => parse(option))
    .filter(s => s.length);

export interface PecoOption {
  bin?: string;
  reject?: boolean;
  exec?: string;
  query?: string;
  prompt?: string;
  rcfile?: string;
  bufferSize?: number;
  selectOne?: boolean;
  printQuery?: boolean;
  initialIndex?: number;
  selectionPrefix?: string;
  initialFilter?: 'IgnoreCase' | 'CaseSensitive' | 'SmartCase' | 'Regexp' | 'Fuzzy';
  onCancel?: 'success' | 'error';
  layout?: 'bottom-up' | 'top-down';
}

export const peco = async (candidates: string[], option: PecoOption = { reject: true }): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const peco = spawn(getBinary(option), getOptions(option));

    let selected = '';
    peco.stdout.on('data', data => {
      selected += data;
    });

    peco.stdout.on('end', () => {
      handleCancel(option, selected);
      resolve(selected.trim().split('\n'));
    });

    peco.on('error', handleError(reject, option));
    peco.stdin.on('error', handleError(reject, option));

    peco.stdin.write(candidates.join('\n'));
    peco.stdin.end();
  });
};

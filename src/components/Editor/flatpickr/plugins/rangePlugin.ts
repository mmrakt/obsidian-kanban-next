import 'obsidian';

import { Plugin } from '../types/options';

export interface Config {
  input?: string | HTMLInputElement;
  position?: 'left';
  win?: Window;
}

declare global {
  interface Window {
    rangePlugin: (config?: Config) => void;
  }
}

function rangePlugin(config: Config = {}): Plugin {
  return function (fp) {
    let dateFormat = '',
      secondInput: HTMLInputElement,
      _secondInputFocused: boolean,
      _prevDates: Date[];

    const win = config.win || activeWindow;

    const createSecondInput = () => {
      if (config.input) {
        secondInput =
          typeof config.input === 'string'
            ? (win.document.querySelector(config.input) as HTMLInputElement)
            : config.input;

        if (!secondInput) {
          fp.config.errorHandler(new Error('Invalid input element specified'));
          return;
        }

        if (fp.config.wrap) {
          secondInput = secondInput.querySelector('[data-input]') as HTMLInputElement;
        }
      } else {
        secondInput = fp._input.cloneNode() as HTMLInputElement;
        secondInput.removeAttribute('id');
        (secondInput as any)._flatpickr = undefined;
      }

      if (secondInput.value) {
        const parsedDate = fp.parseDate(secondInput.value);

        if (parsedDate) fp.selectedDates.push(parsedDate);
      }

      secondInput.setAttribute('data-fp-omit', '');

      if (fp.config.clickOpens) {
        fp._bind(secondInput, ['focus', 'click'], () => {
          if (fp.selectedDates[1]) {
            fp.latestSelectedDateObj = fp.selectedDates[1];
            fp._setHoursFromDate(fp.selectedDates[1]);
            fp.jumpToDate(fp.selectedDates[1]);
          }

          _secondInputFocused = true;
          fp.isOpen = false;
          fp.open(undefined, config.position === 'left' ? fp._input : secondInput);
        });

        fp._bind(fp._input, ['focus', 'click'], (e: FocusEvent) => {
          e.preventDefault();
          fp.isOpen = false;
          fp.open();
        });
      }

      if (fp.config.allowInput)
        fp._bind(secondInput, 'keydown', (e: KeyboardEvent) => {
          if ((e as KeyboardEvent).key === 'Enter') {
            fp.setDate([fp.selectedDates[0], secondInput.value], true, dateFormat);
            secondInput.click();
          }
        });

      if (!config.input)
        fp._input.parentNode &&
          fp._input.parentNode.insertBefore(secondInput, fp._input.nextSibling);
    };

    const plugin = {
      onParseConfig() {
        fp.config.mode = 'range';

        dateFormat = fp.config.altInput ? fp.config.altFormat : fp.config.dateFormat;
      },

      onReady() {
        createSecondInput();
        fp.config.ignoredFocusElements.push(secondInput);
        if (fp.config.allowInput) {
          fp._input.removeAttribute('readonly');
          secondInput.removeAttribute('readonly');
        } else {
          secondInput.setAttribute('readonly', 'readonly');
        }

        fp._bind(fp._input, 'focus', () => {
          fp.latestSelectedDateObj = fp.selectedDates[0];
          fp._setHoursFromDate(fp.selectedDates[0]);
          _secondInputFocused = false;
          fp.jumpToDate(fp.selectedDates[0]);
        });

        if (fp.config.allowInput)
          fp._bind(fp._input, 'keydown', (e: KeyboardEvent) => {
            if ((e as KeyboardEvent).key === 'Enter')
              fp.setDate([fp._input.value, fp.selectedDates[1]], true, dateFormat);
          });

        fp.setDate(fp.selectedDates, false);
        plugin.onValueUpdate(fp.selectedDates);
        fp.loadedPlugins.push('range');
      },

      onPreCalendarPosition() {
        if (_secondInputFocused) {
          fp._positionElement = secondInput;
          win.setTimeout(() => {
            fp._positionElement = fp._input;
          }, 0);
        }
      },

      onChange() {
        if (!fp.selectedDates.length) {
          win.setTimeout(() => {
            if (fp.selectedDates.length) return;

            secondInput.value = '';
            _prevDates = [];
          }, 10);
        }

        if (_secondInputFocused) {
          win.setTimeout(() => {
            secondInput.focus();
          }, 0);
        }
      },

      onDestroy() {
        if (!config.input)
          secondInput.parentNode && secondInput.parentNode.removeChild(secondInput);
      },

      onValueUpdate(selDates: Date[]) {
        if (!secondInput) return;

        _prevDates =
          !_prevDates || selDates.length >= _prevDates.length ? [...selDates] : _prevDates;

        if (_prevDates.length > selDates.length) {
          const newSelectedDate = selDates[0];
          const newDates = _secondInputFocused
            ? [_prevDates[0], newSelectedDate]
            : [newSelectedDate, _prevDates[1]];

          if (newDates[0].getTime() > newDates[1].getTime()) {
            if (_secondInputFocused) {
              newDates[0] = newDates[1];
            } else {
              newDates[1] = newDates[0];
            }
          }

          fp.setDate(newDates, false);
          _prevDates = [...newDates];
        }

        [fp._input.value = '', secondInput.value = ''] = fp.selectedDates.map((d: Date) =>
          fp.formatDate(d, dateFormat)
        );
      },
    };

    return plugin;
  };
}

export default rangePlugin;

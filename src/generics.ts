import {
  CustomBoolean,
  CustomFunction,
  CustomList,
  CustomMap,
  CustomNil,
  CustomNumber,
  CustomString,
  CustomValue,
  deepHash,
  DefaultType,
  ObjectValue,
  VM
} from 'greybel-interpreter';

import { isValidUnicodeChar } from './utils';

export const print = CustomFunction.createExternal(
  'print',
  (
    vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const value = args.get('value');
    const delimiter = args.get('delimiter');

    if (delimiter instanceof CustomString) {
      vm.handler.outputHandler.print(
        vm,
        value.toString() + delimiter.toString(),
        {
          appendNewLine: false,
          replace: false
        }
      );
    } else {
      vm.handler.outputHandler.print(vm, value.toString(), {
        appendNewLine: true,
        replace: false
      });
    }

    return Promise.resolve(DefaultType.Void);
  }
)
  .addArgument('value', new CustomString(''))
  .addArgument('delimiter');

export const exit = CustomFunction.createExternal(
  'exit',
  (
    vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    vm.handler.outputHandler.print(vm, args.get('value').toString());
    vm.exit();
    return Promise.resolve(DefaultType.Void);
  }
).addArgument('value');

export const wait = CustomFunction.createExternal(
  'wait',
  (
    vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const delay = args.get('delay');

    if (delay instanceof CustomNil) {
      throw new Error('wait: Invalid arguments');
    }

    const ms = delay.toNumber() * 1000;

    if (ms < 10 || ms > 300000) {
      throw new Error('wait: time must have a value between 0.01 and 300');
    }

    return new Promise((resolve) => {
      const onExit = () => {
        clearTimeout(timeout);
        resolve(DefaultType.Void);
      };
      const timeout = setTimeout(() => {
        vm.getSignal().removeListener('exit', onExit);
        resolve(DefaultType.Void);
      }, ms);

      vm.getSignal().once('exit', onExit);
    });
  }
).addArgument('delay', new CustomNumber(1));

export const char = CustomFunction.createExternal(
  'char',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const code = args.get('code');

    if (code instanceof CustomNil) {
      return Promise.resolve(DefaultType.Void);
    }

    if (!isValidUnicodeChar(code.toInt())) {
      throw new Error('char: invalid char code.');
    }

    const str = String.fromCharCode(code.toInt());
    return Promise.resolve(new CustomString(str));
  }
).addArgument('code', new CustomNumber(65));

export const code = CustomFunction.createExternalWithSelf(
  'code',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const value = args.get('self');

    if (value instanceof CustomNil) {
      throw new Error('code: invalid char code.');
    }

    const str = value.toString();
    const strCode = str.charCodeAt(0);

    if (!isValidUnicodeChar(strCode)) {
      throw new Error('code: invalid char code.');
    }

    return Promise.resolve(new CustomNumber(strCode));
  }
);

export const str = CustomFunction.createExternal(
  'str',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    return Promise.resolve(new CustomString(args.get('value').toString()));
  }
).addArgument('value', new CustomString(''));

export const val = CustomFunction.createExternalWithSelf(
  'val',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    if (origin instanceof CustomNumber) {
      return Promise.resolve(origin);
    } else if (origin instanceof CustomString) {
      const isNumber = /^[+-]?([\d][\d,]*)?(\.[\d+]+)?([Ee][+-]?\d+)?$/.test(
        origin.value.trim()
      );
      return Promise.resolve(
        isNumber
          ? new CustomNumber(Number(origin.value.replace(/,/g, '')))
          : DefaultType.Zero
      );
    }
    return Promise.resolve(DefaultType.Void);
  }
);

export const hash = CustomFunction.createExternal(
  'hash',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const value = args.get('value');

    return Promise.resolve(new CustomNumber(deepHash(value)));
  }
)
  .addArgument('value')
  .addArgument('recursionDepth', new CustomNumber(16));

export const range = CustomFunction.createExternal(
  'range',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const from = args.get('from');
    const to = args.get('to');
    const step = args.get('step');

    if (!(to instanceof CustomNumber)) {
      throw new Error('range() "to" parameter not a number');
    }

    const start = from.toNumber();
    const end = to.toNumber();
    const inc = step?.toInt() || (end >= start ? 1 : -1);

    if (inc === 0) {
      throw new Error('range() error (step==0)');
    }

    const check = inc > 0 ? (i: number) => i <= end : (i: number) => i >= end;
    const result: Array<CustomValue> = [];

    for (let index = start; check(index); index += inc) {
      result.push(new CustomNumber(index));
    }

    return Promise.resolve(new CustomList(result));
  }
)
  .addArgument('from', DefaultType.Zero)
  .addArgument('to', DefaultType.Zero)
  .addArgument('step');

export const customYield = CustomFunction.createExternal(
  'yield',
  (
    _vm: VM,
    _self: CustomValue,
    _args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    return new Promise((resolve) => {
      process.nextTick(() => resolve(DefaultType.Void));
    });
  }
);

export const refEquals = CustomFunction.createExternal(
  'refEquals',
  (
    _vm: VM,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const a = args.get('a');
    const b = args.get('b');

    if (a instanceof CustomNil) {
      return Promise.resolve(new CustomBoolean(b instanceof CustomNil));
    } else if (a instanceof CustomNumber) {
      return Promise.resolve(
        new CustomBoolean(b instanceof CustomNumber && a.value === b.value)
      );
    } else if (a instanceof CustomString) {
      return Promise.resolve(
        new CustomBoolean(b instanceof CustomString && a.value === b.value)
      );
    } else if (a instanceof CustomList) {
      return Promise.resolve(
        new CustomBoolean(b instanceof CustomList && a.value === b.value)
      );
    } else if (a instanceof CustomMap) {
      return Promise.resolve(
        new CustomBoolean(b instanceof CustomMap && a.value === b.value)
      );
    } else if (a instanceof CustomFunction) {
      return Promise.resolve(
        new CustomBoolean(b instanceof CustomFunction && a.value === b.value)
      );
    }

    return Promise.resolve(new CustomBoolean(false));
  }
)
  .addArgument('a')
  .addArgument('b');

export const version = CustomFunction.createExternal(
  'version',
  (
    _vm: VM,
    _self: CustomValue,
    _args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const d = new ObjectValue();

    d.set(new CustomString('miniscript'), new CustomString('1.5.9'));
    d.set(new CustomString('buildDate'), new CustomString('2000.01.01'));

    d.set(new CustomString('host'), new CustomString('3.3.0'));
    d.set(new CustomString('hostName'), new CustomString('Greybel'));
    d.set(
      new CustomString('hostInfo'),
      new CustomString('https://github.com/ayecue/greybel-interpreter')
    );

    return Promise.resolve(new CustomMap(d));
  }
);

export const stackTrace = CustomFunction.createExternal(
  'stackTrace',
  async (vm: VM): Promise<CustomValue> => {
    const stackTrace = vm
      .getStacktrace()
      .slice(1)
      .map((op) => {
        return new CustomString(
          `at ${op.source.path}:${op.source?.start.line ?? 0}:${op.source?.start.character ?? 0
          }`
        );
      });

    return new CustomList(stackTrace);
  }
);

export const time = CustomFunction.createExternal(
  'time',
  (
    vm: VM,
    _self: CustomValue,
    _args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    return Promise.resolve(
      new CustomNumber((Date.now() - vm.getTime()) / 1000)
    );
  }
);

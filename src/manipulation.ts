import {
  CustomBoolean,
  CustomFunction,
  CustomList,
  CustomMap,
  CustomNil,
  CustomNumber,
  CustomString,
  CustomValue,
  CustomValueWithIntrinsics,
  deepEqual,
  DefaultType,
  OperationContext
} from 'greybel-interpreter';

import { checkRange, itemAtIndex } from './utils';

export const hasIndex = CustomFunction.createExternalWithSelf(
  'hasIndex',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const index = args.get('index');

    if (index instanceof CustomNil) {
      throw new Error('hasIndex requires an index argument');
    }

    if (origin instanceof CustomMap) {
      return Promise.resolve(new CustomBoolean(origin.value.has(index)));
    } else if (origin instanceof CustomList) {
      if (!(index instanceof CustomNumber)) {
        return Promise.resolve(DefaultType.False);
      }
      const listIndex = index.toInt();
      return Promise.resolve(new CustomBoolean(!!origin.value.at(listIndex)));
    } else if (origin instanceof CustomString) {
      const strIndex = index.toInt();
      return Promise.resolve(new CustomBoolean(!!origin.value.at(strIndex)));
    }

    return Promise.resolve(DefaultType.False);
  }
).addArgument('index');

export const indexOf = CustomFunction.createExternalWithSelf(
  'indexOf',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const value = args.get('value');
    const after = args.get('after');

    if (value instanceof CustomNil) {
      throw new Error('indexOf requires a value argument');
    }

    if (origin instanceof CustomMap) {
      let sawAfter: boolean = after instanceof CustomNil;
      for (const [key, item] of origin.value.entries()) {
        if (!sawAfter) {
          if (deepEqual(after, key)) sawAfter = true;
        } else if (deepEqual(value, item)) {
          return Promise.resolve(key);
        }
      }
    } else if (origin instanceof CustomList) {
      if (after instanceof CustomNil) {
        const index = origin.value.findIndex((item) => {
          return deepEqual(value, item);
        });

        if (index !== -1) {
          return Promise.resolve(new CustomNumber(index));
        }
      } else {
        let afterIdx = after.toInt();
        if (afterIdx < -1) afterIdx += origin.value.length;
        if (afterIdx < -1 || afterIdx >= origin.value.length - 1)
          return Promise.resolve(DefaultType.Void);
        const index = origin.value.findIndex((item, idx) => {
          return idx > afterIdx && deepEqual(value, item);
        });

        if (index !== -1) {
          return Promise.resolve(new CustomNumber(index));
        }
      }
    } else if (origin instanceof CustomString) {
      if (after instanceof CustomNil) {
        const index = origin.value.indexOf(value.toString());

        if (index !== -1) {
          return Promise.resolve(new CustomNumber(index));
        }
      } else {
        let afterIdx = after.toInt();
        if (afterIdx < -1) afterIdx += origin.value.length;
        if (afterIdx < -1 || afterIdx >= origin.value.length - 1)
          return Promise.resolve(DefaultType.Void);
        const index = origin.value.indexOf(value.toString(), afterIdx + 1);

        if (index !== -1) {
          return Promise.resolve(new CustomNumber(index));
        }
      }
    }

    return Promise.resolve(DefaultType.Void);
  }
)
  .addArgument('value')
  .addArgument('after');

export const indexes = CustomFunction.createExternalWithSelf(
  'indexes',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomMap) {
      const keys = Array.from(origin.value.keys());
      return Promise.resolve(new CustomList(keys));
    } else if (origin instanceof CustomList || origin instanceof CustomString) {
      const keys = Object.keys(origin.value).map(
        (item) => new CustomNumber(Number(item))
      );
      return Promise.resolve(new CustomList(keys));
    }

    return Promise.resolve(DefaultType.Void);
  }
);

export const values = CustomFunction.createExternalWithSelf(
  'values',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomMap) {
      const values = Array.from(origin.value.values());
      return Promise.resolve(new CustomList(values));
    } else if (origin instanceof CustomList) {
      const values = Object.values(origin.value);
      return Promise.resolve(new CustomList(values));
    } else if (origin instanceof CustomString) {
      const values = Object.values(origin.value).map(
        (item) => new CustomString(item)
      );
      return Promise.resolve(new CustomList(values));
    }

    return Promise.resolve(DefaultType.Void);
  }
);

export const len = CustomFunction.createExternalWithSelf(
  'len',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomMap) {
      return Promise.resolve(new CustomNumber(origin.value.size));
    } else if (origin instanceof CustomList || origin instanceof CustomString) {
      return Promise.resolve(new CustomNumber(origin.value.length));
    }

    return Promise.resolve(DefaultType.Void);
  }
);

export const lower = CustomFunction.createExternalWithSelf(
  'lower',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomString) {
      return Promise.resolve(new CustomString(origin.value.toLowerCase()));
    }
    return Promise.resolve(origin);
  }
);

export const upper = CustomFunction.createExternalWithSelf(
  'upper',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomString) {
      return Promise.resolve(new CustomString(origin.value.toUpperCase()));
    }
    return Promise.resolve(origin);
  }
);

export const slice = CustomFunction.createExternalWithSelf(
  'slice',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const from = args.get('from');
    const to = args.get('to');

    if (from instanceof CustomNil) {
      return Promise.resolve(DefaultType.Void);
    }

    if (origin instanceof CustomList || origin instanceof CustomString) {
      return Promise.resolve(origin.slice(from, to));
    }

    return Promise.resolve(DefaultType.Void);
  }
)
  .addArgument('from', DefaultType.Zero)
  .addArgument('to');

export const insert = CustomFunction.createExternalWithSelf(
  'insert',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const index = args.get('index');
    const value = args.get('value');

    if (index instanceof CustomNil) {
      throw new Error('insert: index argument required');
    }

    if (!(index instanceof CustomNumber)) {
      throw new Error('insert: number required for index argument');
    }

    let idx = index.toInt();

    if (origin instanceof CustomList) {
      if (idx < 0) idx += origin.value.length + 1;
      checkRange(idx, 0, origin.value.length);
      origin.value.splice(idx, 0, value);
      return Promise.resolve(origin);
    } else if (origin instanceof CustomString) {
      if (idx < 0) idx += origin.value.length + 1;
      checkRange(idx, 0, origin.value.length);
      const str =
        origin.value.substr(0, idx) +
        value.toString() +
        origin.value.substr(idx);
      return Promise.resolve(new CustomString(str));
    }

    throw new Error('insert called on invalid type');
  }
)
  .addArgument('index')
  .addArgument('value');

export const sort = CustomFunction.createExternalWithSelf(
  'sort',
  (
    ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const key = args.get('key');
    const asc = args.get('asc');

    if (!(origin instanceof CustomList)) {
      return null;
    }

    const isAscending = asc.toTruthy();
    const isOrderByKey = !(key instanceof CustomNil);
    const sorted = origin.value.sort((a: CustomValue, b: CustomValue) => {
      if (isOrderByKey) {
        if (a instanceof CustomValueWithIntrinsics) {
          a = a.get(key, ctx.contextTypeIntrinsics);
        } else {
          a = DefaultType.Void;
        }
        if (b instanceof CustomValueWithIntrinsics) {
          b = b.get(key, ctx.contextTypeIntrinsics);
        } else {
          b = DefaultType.Void;
        }
      }

      if (isAscending) {
        if (a instanceof CustomString && b instanceof CustomString) {
          return a.toString().localeCompare(b.toString());
        }

        return a.toNumber() - b.toNumber();
      }

      if (a instanceof CustomString && b instanceof CustomString) {
        return b.toString().localeCompare(a.toString());
      }

      return b.toNumber() - a.toNumber();
    });

    return Promise.resolve(new CustomList(sorted));
  }
)
  .addArgument('key')
  .addArgument('asc', new CustomNumber(1));

export const sum = CustomFunction.createExternalWithSelf(
  'sum',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    let result = 0;

    if (origin instanceof CustomList || origin instanceof CustomMap) {
      origin.value.forEach((v) => {
        result += v instanceof CustomNil ? 0 : v.toNumber();
      });
    }

    return Promise.resolve(new CustomNumber(result));
  }
);

export const shuffle = CustomFunction.createExternalWithSelf(
  'shuffle',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomList) {
      const value = origin.value;

      if (value.length > 10000) {
        throw new Error('shuffle: list too large');
      }

      for (let i = value.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [value[i], value[j]] = [value[j], value[i]];
      }
    } else if (origin instanceof CustomMap) {
      const value = origin.value;

      if (value.size > 10000) {
        throw new Error('shuffle: map too large');
      }

      const keys = Array.from(value.keys());

      for (let i = keys.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
      }

      const values = Array.from(value.values());

      for (let i = values.length - 1; i >= 0; i--) {
        origin.set(keys[i], values[i]);
      }
    }

    return Promise.resolve(DefaultType.Void);
  }
);

export const pop = CustomFunction.createExternalWithSelf(
  'pop',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomMap) {
      const keys = Array.from(origin.value.keys());
      const item = origin.value.get(keys[0]);
      origin.value.delete(keys[0]);
      return Promise.resolve(item || DefaultType.Void);
    } else if (origin instanceof CustomList) {
      return Promise.resolve(origin.value.pop() || DefaultType.Void);
    }

    return Promise.resolve(DefaultType.Void);
  }
);

export const pull = CustomFunction.createExternalWithSelf(
  'pull',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomList) {
      return Promise.resolve(origin.value.shift() || DefaultType.Void);
    }

    return Promise.resolve(DefaultType.Void);
  }
);

export const push = CustomFunction.createExternalWithSelf(
  'push',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const value = args.get('value');

    if (origin instanceof CustomMap) {
      if (origin.value === value.value) {
        throw new Error('(push) Unable to stack to itself');
      }

      if (value instanceof CustomNil) {
        throw new Error('Key map cannot be null.');
      }

      if (origin.has(value)) {
        throw new Error(`Key map has already been added: ${value.toString()}`);
      }

      origin.set(value, new CustomNumber(1));
      return Promise.resolve(origin);
    } else if (origin instanceof CustomList) {
      if (origin.value === value.value) {
        throw new Error('(push) Unable to stack to itself');
      }

      origin.value.push(value);
      return Promise.resolve(origin);
    }

    return Promise.resolve(DefaultType.Void);
  }
).addArgument('value');

export const remove = CustomFunction.createExternalWithSelf(
  'remove',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const keyValue = args.get('keyValue');

    if (origin instanceof CustomNil || keyValue instanceof CustomNil) {
      throw new Error("argument to 'remove' must not be null");
    }

    if (origin instanceof CustomMap) {
      if (origin.has(keyValue)) {
        origin.value.delete(keyValue);
        return Promise.resolve(DefaultType.True);
      }
      return Promise.resolve(DefaultType.False);
    } else if (origin instanceof CustomList) {
      const listIndex = itemAtIndex(origin.value, keyValue.toInt());
      if (Object.prototype.hasOwnProperty.call(origin.value, listIndex)) {
        origin.value.splice(listIndex, 1);
      }
      return Promise.resolve(DefaultType.Void);
    } else if (origin instanceof CustomString) {
      const replaced = new CustomString(
        origin.value.replace(keyValue.toString(), '')
      );
      return Promise.resolve(replaced);
    }

    throw new Error("Type Error: 'remove' requires map, list, or string");
  }
).addArgument('keyValue');

export const join = CustomFunction.createExternalWithSelf(
  'join',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');

    if (origin instanceof CustomList) {
      const seperator = args.get('seperator').toString();

      if (seperator.length > 128) {
        throw new Error('join: delimiter too large');
      }

      const str = origin.value.join(seperator);
      return Promise.resolve(new CustomString(str));
    }

    return Promise.resolve(DefaultType.Void);
  }
).addArgument('seperator', new CustomString(' '));

export const split = CustomFunction.createExternalWithSelf(
  'split',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const delimiter = args.get('delimiter');
    const maxCount = args.get('maxCount');

    if (origin instanceof CustomString && delimiter instanceof CustomString) {
      let result = origin.toString().split(delimiter.toString());

      if (maxCount instanceof CustomNumber) {
        result = result.slice(0, maxCount.toInt());
      }

      const list = result.map((item) => new CustomString(item));
      return Promise.resolve(new CustomList(list));
    }

    return Promise.resolve(DefaultType.Void);
  }
)
  .addArgument('delimiter')
  .addArgument('maxCount');

export const replace = CustomFunction.createExternalWithSelf(
  'replace',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const maxCount = args.get('maxCount');
    let actualMaxCount = -1;

    if (!(maxCount instanceof CustomNil)) {
      actualMaxCount = maxCount.toInt();
      if (actualMaxCount < 1) {
        return Promise.resolve(origin);
      }
    }

    if (origin instanceof CustomString) {
      const toReplace = args.get('toReplace');
      const replaceWith = args.get('replaceWith');

      if (toReplace instanceof CustomNil || replaceWith instanceof CustomNil) {
        throw new Error('replace: Invalid arguments');
      }

      if (toReplace.toString() === '') {
        throw new Error("Type Error: 'replace' oldVal can't be empty or null");
      }

      const replaced = origin
        .toString()
        .replaceAll(toReplace.toString(), replaceWith.toString());

      return Promise.resolve(new CustomString(replaced));
    } else if (origin instanceof CustomList) {
      const toReplace = args.get('toReplace');
      const replaceWith = args.get('replaceWith');

      if (toReplace instanceof CustomNil || replaceWith instanceof CustomNil) {
        throw new Error('replace: Invalid arguments');
      }

      const hash = toReplace.hash();

      for (let index = 0; index < origin.value.length; index++) {
        if (origin.value[index].hash() === hash) {
          origin.value[index] = replaceWith;
        }

        if (actualMaxCount > 0 && actualMaxCount === index) {
          break;
        }
      }

      return Promise.resolve(origin);
    } else if (origin instanceof CustomMap) {
      const toReplace = args.get('toReplace');
      const replaceWith = args.get('replaceWith');

      if (toReplace instanceof CustomNil || replaceWith instanceof CustomNil) {
        throw new Error('replace: Invalid arguments');
      }

      const hash = toReplace.hash();
      let index = 0;

      for (const [key, item] of origin.value.entries()) {
        if (item.hash() === hash) {
          origin.value.set(key, replaceWith);
        }

        if (actualMaxCount > 0 && actualMaxCount === index) {
          break;
        }

        index++;
      }

      return Promise.resolve(origin);
    }

    throw new Error("Type Error: 'replace' requires map, list, or string");
  }
)
  .addArgument('toReplace')
  .addArgument('replaceWith')
  .addArgument('maxCount');

export const trim = CustomFunction.createExternalWithSelf(
  'trim',
  (
    _ctx: OperationContext,
    _self: CustomValue,
    args: Map<string, CustomValue>
  ): Promise<CustomValue> => {
    const origin = args.get('self');
    const trimmed = origin.toString().trim();

    return Promise.resolve(new CustomString(trimmed));
  }
);

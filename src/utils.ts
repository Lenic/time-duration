import type { Observable } from 'rxjs';
import type { MutableRefObject } from 'react';

import dayjs from 'dayjs';
import { fromEvent, merge, Subject } from 'rxjs';
import { scan, map, debounceTime } from 'rxjs/operators';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type TResultItem = {
  id: string;
  begin: string;
  end: string;
  total: string;
  minutes: number;
};

export const convertMinutesToHuman = (mins: number) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  return `${hours} h ${minutes} min`;
};

export const useMappedValue = <T, R = T>(observable: Observable<T>, defaultValue: R, predicate?: (args: T) => R) => {
  const [value, setValue] = useState<R>(defaultValue);

  useEffect(() => {
    const subscription = observable.subscribe((val) => {
      setValue(predicate ? predicate(val) : (val as unknown as R));
    });
    return () => subscription.unsubscribe();
  }, [observable, predicate]);

  return value;
};

export const mapperForUseValue = <T>(val: T) => val;
export const useValue = <T>(observable: Observable<T>, defaultValue: T) =>
  useMappedValue(observable, defaultValue, mapperForUseValue);

export const useList = () => {
  const prefix = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const source$ = useMemo(() => new Subject<TResultItem>(), []);
  const reset$ = useMemo(() => new Subject<void>(), []);

  const handleReset = useCallback(() => reset$.next(), [reset$]);
  const handlePushNew = useCallback(
    (begin: string, end: string) => {
      const beginValue = dayjs(`${prefix} ${begin}`);

      let endValue = dayjs(`${prefix} ${end}`);
      endValue = endValue.isBefore(beginValue) ? endValue.add(1, 'day') : endValue;

      const mins = endValue.diff(beginValue, 'minutes');

      source$.next({
        id: Date.now().toString(),
        begin: beginValue.format('HH:mm'),
        end: endValue.format('HH:mm'),
        minutes: mins,
        total: convertMinutesToHuman(mins),
      });
    },
    [prefix, source$],
  );

  const list$ = useMemo(
    () =>
      merge(
        source$.pipe(map((item) => (prev: TResultItem[]) => [...prev, item])),
        reset$.pipe(map(() => () => [] as TResultItem[])),
      ).pipe(scan((acc, fn) => fn(acc), [] as TResultItem[])),
    [reset$, source$],
  );

  return [list$, handlePushNew, handleReset] as const;
};

export const useAutoFcous = (
  firstRef: MutableRefObject<HTMLInputElement>,
  secendRef: MutableRefObject<HTMLInputElement>,
) => {
  useEffect(() => {
    const focusSubscription = fromEvent(window, 'focus')
      .pipe(debounceTime(30))
      .subscribe(() => {
        const firstValue = firstRef.current.value.trim();
        const secondValue = secendRef.current.value.trim();
        if (!firstValue && !secondValue) {
          firstRef.current.focus();
        } else if (firstValue && !secondValue) {
          secendRef.current.focus();
        }
      });

    return () => focusSubscription.unsubscribe();
  }, [firstRef, secendRef]);
};

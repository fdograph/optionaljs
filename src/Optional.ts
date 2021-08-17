export type ConsumerFunction<ValueType, ReturnType = void> = (
  value: ValueType
) => ReturnType;

export type NilType = null | undefined;
export type ValueOrNullType<T, U = T> = T extends NilType ? null : U;

export class NoSuchElementException extends Error {
  constructor(m?: string) {
    super(m ?? 'Tried to .get() an empty value');
  }
}

export const isNil = (v: unknown): v is NilType => {
  return v === undefined || v === null;
};

export class Optional<T> {
  public static empty(): Optional<null> {
    return new Optional(null);
  }

  public static of<ValueType>(value: ValueType): Optional<ValueType> {
    return new Optional(value);
  }

  public static ofNullable<ValueType>(
    value?: ValueType
  ): Optional<ValueOrNullType<ValueType>> {
    if (isNil(value)) {
      return Optional.empty() as Optional<ValueOrNullType<ValueType>>;
    }

    return Optional.of(value) as Optional<ValueOrNullType<ValueType>>;
  }

  protected constructor(private readonly value: T) {}

  protected applyIfPresent<ReturnType = T>(
    effect: ConsumerFunction<T, Optional<ReturnType>>
  ): Optional<ValueOrNullType<T, ReturnType>> {
    if (isNil(this.value)) {
      return Optional.empty() as Optional<ValueOrNullType<T, ReturnType>>;
    }

    return effect(this.value) as Optional<ValueOrNullType<T, ReturnType>>;
  }

  public isPresent(): boolean {
    return !isNil(this.value);
  }

  public isEmpty(): boolean {
    return isNil(this.value);
  }

  public ifPresent(consumer: ConsumerFunction<T>): void {
    if (!isNil(this.value)) {
      consumer(this.value);
    }
  }

  public get(): T {
    if (isNil(this.value)) {
      throw new NoSuchElementException();
    }

    return this.value;
  }

  public orElse<U>(other: T extends NilType ? U : T): T | U {
    if (isNil(this.value)) {
      return Optional.of(other).get();
    }

    return this.get();
  }

  public orElseGet<U>(
    getter: ConsumerFunction<NilType, T extends NilType ? U : T>
  ): T | U {
    if (isNil(this.value)) {
      return getter(this.value);
    }

    return this.value;
  }

  public orElseThrow<ExceptionType extends Error>(ex: ExceptionType): T {
    if (isNil(this.value)) {
      throw ex;
    }

    return this.value;
  }

  public filter(
    filterFn: ConsumerFunction<T, boolean>
  ): Optional<ValueOrNullType<T, T | null>> {
    return this.applyIfPresent((val: T) =>
      filterFn(val) ? Optional.of(val) : Optional.empty()
    );
  }

  public map<NewType>(
    mapper: ConsumerFunction<T, NewType>
  ): Optional<ValueOrNullType<T, NewType>> {
    return this.applyIfPresent((val: T) => Optional.of(mapper(val)));
  }

  public flatMap<NewType>(
    mapper: ConsumerFunction<T, Optional<NewType>>
  ): Optional<ValueOrNullType<T, NewType>> {
    return this.applyIfPresent((val: T) => mapper(val));
  }
}

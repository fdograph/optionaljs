export type ConsumerFunction<ValueType, ReturnType = void> = (
  value: ValueType
) => ReturnType;

export type NilType = null | undefined;

export class NoSuchElementException extends Error {
  constructor(m?: string) {
    super(m ?? 'No such element');
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
  ): Optional<null> | Optional<ValueType> {
    return isNil(value) ? Optional.empty() : Optional.of(value);
  }

  protected constructor(private readonly value: T) {}

  protected applyIfPresent<ReturnType = T>(
    effect: ConsumerFunction<T, Optional<ReturnType>>
  ): Optional<ReturnType> | Optional<null> {
    if (isNil(this.value)) {
      return Optional.empty();
    }

    return effect(this.value);
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

  public filter(filterFn: ConsumerFunction<T, boolean>): Optional<T | null> {
    return this.applyIfPresent((val: T) =>
      filterFn(val) ? Optional.of(val) : Optional.empty()
    );
  }

  public map<NewType>(
    mapper: ConsumerFunction<T, NewType>
  ): Optional<NewType | null> {
    return this.applyIfPresent((val: T) => Optional.of(mapper(val)));
  }

  public flatMap<NewType>(
    mapper: ConsumerFunction<T, Optional<NewType>>
  ): Optional<NewType | null> {
    return this.applyIfPresent((val: T) => mapper(val));
  }
}

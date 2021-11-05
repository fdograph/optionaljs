export type ConsumerFunction<ValueType, ReturnType = void> = (value: ValueType) => ReturnType;

export type NilType = null | undefined;
export type ValueOrNullType<ValueType, FallbackType = ValueType, EmptyType = null> = ValueType extends NilType
  ? EmptyType
  : FallbackType;

export class NoSuchElementException extends Error {
  constructor(m?: string) {
    super(m ?? 'Tried to .get() an empty value');
  }
}

export class Optional<T> {
  protected static valueIsNil(v: unknown): v is NilType {
    return v === undefined || v === null;
  }

  public static empty(): Optional<null> {
    return new Optional(null);
  }

  public static of<ValueType>(value: ValueType): Optional<ValueType> {
    return new Optional(value);
  }

  public static ofNullable<ValueType>(value: ValueType | NilType): Optional<ValueOrNullType<ValueType>> {
    return (Optional.valueIsNil(value) ? Optional.empty() : Optional.of(value)) as Optional<ValueOrNullType<ValueType>>;
  }

  protected constructor(private readonly value: T) {}

  protected applyIfPresent<ReturnType = T>(
    effect: ConsumerFunction<T, Optional<ReturnType>>
  ): Optional<ValueOrNullType<T, ReturnType>> {
    return (this.isEmpty() ? Optional.empty() : effect(this.value)) as Optional<ValueOrNullType<T, ReturnType>>;
  }

  public isEmpty(): boolean {
    return Optional.valueIsNil(this.value);
  }

  public isPresent(): boolean {
    return !this.isEmpty();
  }

  public ifPresent(consumer: ConsumerFunction<T>): void {
    if (this.isPresent()) {
      consumer(this.value);
    }
  }

  public get(): T {
    return this.orElseThrow(new NoSuchElementException());
  }

  public orElse<U>(other: ValueOrNullType<T, T, U>): ValueOrNullType<T, T, U> {
    return this.orElseGet(() => other);
  }

  public orElseGet<U>(consumerFn: ConsumerFunction<NilType, ValueOrNullType<T, T, U>>): ValueOrNullType<T, T, U> {
    return (this.isEmpty() ? consumerFn(null) : this.get()) as ValueOrNullType<T, T, U>;
  }

  public orElseThrow<Ex extends Error>(throwable: Ex): T {
    if (this.isEmpty()) {
      throw throwable;
    }

    return this.value;
  }

  public filter(filterFn: ConsumerFunction<T, boolean>): Optional<ValueOrNullType<T, T | null>> {
    return this.applyIfPresent((val: T) => (filterFn(val) ? Optional.of(val) : Optional.empty()));
  }

  public map<NewType>(mapper: ConsumerFunction<T, NewType>): Optional<ValueOrNullType<T, NewType>> {
    return this.applyIfPresent((val: T) => Optional.of(mapper(val)));
  }

  public flatMap<NewType>(mapper: ConsumerFunction<T, Optional<NewType>>): Optional<ValueOrNullType<T, NewType>> {
    return this.applyIfPresent((val: T) => mapper(val));
  }
}

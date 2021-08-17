import { NoSuchElementException, Optional } from '../Optional';

describe('Optional class', () => {
  describe('Factory methods', () => {
    describe('empty', () => {
      it('Should create an empty Optional with a null value', () => {
        const emptyOpt = Optional.empty();

        expect(emptyOpt.isEmpty()).toBe(true);
        expect(emptyOpt.isPresent()).toBe(false);
        expect(emptyOpt.orElse(10)).toBe(10);
        expect(emptyOpt.orElseGet(() => 1234)).toBe(1234);
        expect(() => {
          emptyOpt.orElseThrow(new Error('Trying to get empty'));
        }).toThrow();
        expect(() => {
          emptyOpt.get();
        }).toThrow();
      });
    });
    describe('of', () => {
      it('Should create an Optional with a T value', () => {
        const opt = Optional.of('my text');

        expect(opt.isEmpty()).toBe(false);
        expect(opt.isPresent()).toBe(true);
        expect(opt.orElse('another text')).toBe('my text');
        expect(opt.orElseGet(() => 'another text')).toBe('my text');
        expect(() => {
          opt.orElseThrow(new Error('Trying to get empty'));
        }).not.toThrow();
        expect(opt.get()).toEqual('my text');
      });
    });
    describe('ofNullable', () => {
      it('Should create an Optional with a T value', () => {
        const opt = Optional.ofNullable(12345678);

        expect(opt.isEmpty()).toBe(false);
        expect(opt.isPresent()).toBe(true);
        expect(opt.orElse(123)).toBe(12345678);
        expect(opt.orElseGet(() => 12345)).toBe(12345678);
        expect(() => {
          opt.orElseThrow(new Error('Trying to get empty'));
        }).not.toThrow();
        expect(opt.get()).toEqual(12345678);
      });
      it('Should create an Empty optional when supplied with empty value', () => {
        expect(Optional.ofNullable(undefined).isEmpty()).toBe(true);
      });
    });
  });
  describe('Core methods', () => {
    describe('isPresent', () => {
      it('Should return true only when value is not nil', () => {
        expect(Optional.ofNullable(300).isPresent()).toBe(true);
        expect(Optional.ofNullable(false).isPresent()).toBe(true);
        expect(Optional.ofNullable(true).isPresent()).toBe(true);
        expect(Optional.ofNullable([]).isPresent()).toBe(true);
        expect(Optional.ofNullable({}).isPresent()).toBe(true);
        expect(Optional.ofNullable('aaaaaa').isPresent()).toBe(true);

        expect(Optional.ofNullable(undefined).isPresent()).toBe(false);
        expect(Optional.ofNullable(null).isPresent()).toBe(false);
      });
    });
    describe('isEmpty', () => {
      it('Should return true only when value is nil', () => {
        expect(Optional.ofNullable(300).isEmpty()).toBe(false);
        expect(Optional.ofNullable(false).isEmpty()).toBe(false);
        expect(Optional.ofNullable(true).isEmpty()).toBe(false);
        expect(Optional.ofNullable([]).isEmpty()).toBe(false);
        expect(Optional.ofNullable({}).isEmpty()).toBe(false);
        expect(Optional.ofNullable('aaaaaa').isEmpty()).toBe(false);

        expect(Optional.ofNullable(undefined).isEmpty()).toBe(true);
        expect(Optional.ofNullable(null).isEmpty()).toBe(true);
      });
    });
    describe('ifPresent', () => {
      it('should execute the consumer function only if not empty', () => {
        const callback = jest.fn();
        const val = 123456;
        Optional.ofNullable(val).ifPresent(callback);
        expect(callback).toHaveBeenCalledWith(val);
      });

      it('should NOT execute the consumer function if empty', () => {
        const callback = jest.fn();
        Optional.ofNullable(null).ifPresent(callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });
    describe('get', () => {
      it('should get the inner value of the optional or throw if empty', () => {
        expect(Optional.ofNullable(12345).get()).toBe(12345);
        expect(() => {
          Optional.ofNullable(null).get();
        }).toThrow(NoSuchElementException);
        expect(() => {
          Optional.ofNullable(undefined).get();
        }).toThrow(NoSuchElementException);
      });
    });
    describe('orElse', () => {
      it('should return the inner value if not empty', () => {
        expect(Optional.ofNullable(12345).orElse(6789)).toEqual(12345);
      });
      it('should return the default value if empty', () => {
        expect(Optional.ofNullable(null).orElse(6789)).toEqual(6789);
      });
    });
    describe('orElseGet', () => {
      it('should return the inner value if not empty', () => {
        const consumer = jest.fn(() => 987654);
        expect(Optional.ofNullable(12345).orElseGet(consumer)).toEqual(12345);
        expect(consumer).not.toHaveBeenCalled();
      });
      it('should return the result of the callable function if empty', () => {
        const consumer = jest.fn(() => 987654);
        expect(Optional.ofNullable(undefined).orElseGet(consumer)).toEqual(
          987654
        );
        expect(consumer).toHaveBeenCalled();
      });
    });
    describe('orElseThrow', () => {
      class MockException extends Error {}

      it('should return the inner value if not empty', () => {
        expect(() => {
          Optional.ofNullable(12345).orElseThrow(new MockException());
        }).not.toThrow();

        expect(
          Optional.ofNullable(12345).orElseThrow(new MockException())
        ).toEqual(12345);
      });
      it('should throw the given exception if empty', () => {
        expect(() => {
          Optional.ofNullable(null).orElseThrow(new MockException());
        }).toThrow(MockException);
        expect(() => {
          Optional.ofNullable(undefined).orElseThrow(new MockException());
        }).toThrow(MockException);
      });
    });
    describe('filter', () => {
      it('Should empty the optional if the filter function returns false', () => {
        expect(
          Optional.of(10)
            .filter((v) => v > 100)
            .isEmpty()
        ).toEqual(true);
        expect(
          Optional.of(10)
            .filter((v) => v < 100)
            .isEmpty()
        ).toEqual(false);
      });
    });
    describe('map', () => {
      it('Should return an Optional<T> where T is the return type of the mapper function', () => {
        expect(
          Optional.of('1,2,3,4,5')
            .map((value) => value.split(',').map(Number))
            .get()
        ).toEqual([1, 2, 3, 4, 5]);

        expect(
          Optional.of('1,2,3,4,5')
            .map((value) => value.split(','))
            .map((value) => value.map(Number))
            .get()
        ).toEqual([1, 2, 3, 4, 5]);
      });

      it('Should not execute the mapper function if empty', () => {
        const mapper = jest.fn(() => 123);
        expect(Optional.empty().map(mapper).isEmpty()).toEqual(true);
        expect(() => {
          Optional.empty().map(mapper).get();
        }).toThrow();
        expect(mapper).not.toHaveBeenCalled();
      });

      it('Should allow for chaining with other methods', () => {
        expect(
          Optional.of('1,2,3,4,5')
            .map((value) => value.split(','))
            .map((value) => value.map(Number))
            .map((value) => value.map((v) => v * 3))
            .map((value) => value.filter((v) => v % 2 !== 0))
            .filter((value) => value.some((v) => v % 2 === 0))
            .isEmpty()
        ).toEqual(true);

        expect(
          Optional.of('1,2,3,4,5')
            .map((value) => value.split(','))
            .map((value) => value.map(Number))
            .map((value) => value.map((v) => v * 3))
            .map((value) => value.filter((v) => v % 2 !== 0))
            .map((value) => value.map(String))
            .get()
        ).toEqual(['3', '9', '15']);
      });
    });
    describe('flatMap', () => {
      it('Should return an Optional<T> where T is the return type of the mapper function', () => {
        expect(
          Optional.of('1,2,3,4,5')
            .flatMap((value) => Optional.of(value.split(',').map(Number)))
            .get()
        ).toEqual([1, 2, 3, 4, 5]);
      });

      it('Should not execute the mapper function if empty', () => {
        const mapper = jest.fn(() => Optional.of(123));
        expect(Optional.empty().map(mapper).isEmpty()).toEqual(true);
        expect(() => {
          Optional.empty().map(mapper).get();
        }).toThrow();
        expect(mapper).not.toHaveBeenCalled();
      });
    });
  });
});
